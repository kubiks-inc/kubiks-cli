package executor

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"syscall"
)

// NextJSExecutor handles execution of Next.js applications with OpenTelemetry instrumentation
type NextJSExecutor struct {
	instrumentationPath string
}

// NewNextJSExecutor creates a new Next.js executor
func NewNextJSExecutor() (*NextJSExecutor, error) {
	// Get the path to the current executable
	execPath, err := os.Executable()
	if err != nil {
		return nil, fmt.Errorf("failed to get executable path: %w", err)
	}

	// For Homebrew distribution, place instrumentation.js next to the binary
	// This follows best practices for Homebrew packages
	execDir := filepath.Dir(execPath)
	instrumentationPath := filepath.Join(execDir, "instrumentation.js")

	executor := &NextJSExecutor{
		instrumentationPath: instrumentationPath,
	}

	// Ensure instrumentation file exists
	if err := executor.ensureInstrumentationFile(); err != nil {
		return nil, fmt.Errorf("failed to create instrumentation file: %w", err)
	}

	return executor, nil
}

// ensureInstrumentationFile checks if the instrumentation.js file exists
func (e *NextJSExecutor) ensureInstrumentationFile() error {
	// Check if file exists
	if _, err := os.Stat(e.instrumentationPath); err != nil {
		return fmt.Errorf("instrumentation file not found at %s. Please run 'make build' to generate it", e.instrumentationPath)
	}
	return nil
}

// RunDirect runs the Next.js development server directly without TUI wrapper
func (e *NextJSExecutor) RunDirect() error {
	// Pre-validate the environment
	if err := e.validateEnvironment(); err != nil {
		return err
	}

	serviceName := e.getServiceNameFromPackageJSON()
	fmt.Println("🚀 Starting Next.js development server with OpenTelemetry instrumentation...")
	fmt.Printf("📊 Instrumentation file: %s\n", e.instrumentationPath)
	fmt.Printf("🏷️  Service name: %s\n", serviceName)
	fmt.Println("🔗 OTEL Endpoint: http://localhost:7432")
	fmt.Println("📡 OTEL Protocol: http/json")

	cmd, err := e.createCommand()
	if err != nil {
		return err
	}

	// Connect stdio for interactive experience
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	// Set up signal handling for graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Start the command
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start command: %w", err)
	}

	// Handle signals and command completion concurrently
	go func() {
		<-sigChan
		fmt.Println("\n🛑 Shutting down Next.js development server...")

		// Kill the entire process group to ensure all child processes are terminated
		if err := killProcessGroup(cmd.Process.Pid); err != nil {
			fmt.Printf("Warning: failed to kill process group: %v\n", err)
		}
	}()

	// Wait for the command to complete
	err = cmd.Wait()

	// Stop listening for signals
	signal.Stop(sigChan)
	close(sigChan)

	return err
}

// createCommand creates the exec.Cmd with proper NODE_OPTIONS
func (e *NextJSExecutor) createCommand() (*exec.Cmd, error) {
	// Create the command
	cmd := exec.Command("npm", "run", "dev")

	// Get current environment
	env := os.Environ()

	// Get service name from package.json
	serviceName := e.getServiceNameFromPackageJSON()

	// Set NODE_OPTIONS with the instrumentation file
	nodeOptions := fmt.Sprintf("--require %s", e.instrumentationPath)

	// Check if NODE_OPTIONS already exists and append to it
	var nodeOptionsSet bool
	for i, envVar := range env {
		if len(envVar) > 12 && envVar[:12] == "NODE_OPTIONS" {
			env[i] = envVar + " " + nodeOptions
			nodeOptionsSet = true
			break
		}
	}

	// If NODE_OPTIONS doesn't exist, add it
	if !nodeOptionsSet {
		env = append(env, "NODE_OPTIONS="+nodeOptions)
	}

	// Set OpenTelemetry environment variables
	env = append(env, "COLLECTOR_URL=http://localhost:7432")
	env = append(env, "OTEL_EXPORTER_OTLP_PROTOCOL=http/json")
	env = append(env, "OTEL_SERVICE_NAME="+serviceName)

	cmd.Env = env

	// Set working directory to current directory
	cmd.Dir, _ = os.Getwd()

	// Set platform-specific process attributes
	configurePlatformSpecific(cmd)

	return cmd, nil
}

// validateEnvironment checks for common issues before running the command
func (e *NextJSExecutor) validateEnvironment() error {
	// Check if we're in a directory with package.json
	if _, err := os.Stat("package.json"); os.IsNotExist(err) {
		return fmt.Errorf("package.json not found in current directory. Please run this command from a Next.js project root")
	}

	// Check if npm is available
	if _, err := exec.LookPath("npm"); err != nil {
		return fmt.Errorf("npm not found in PATH. Please install Node.js and npm")
	}

	// Check if node_modules exists
	if _, err := os.Stat("node_modules"); os.IsNotExist(err) {
		return fmt.Errorf("node_modules not found. Please run 'npm install' first")
	}

	// Check if the instrumentation file exists and can be created
	if err := e.ensureInstrumentationFile(); err != nil {
		return fmt.Errorf("failed to create instrumentation file: %w", err)
	}

	return nil
}

// getServiceNameFromPackageJSON reads the service name from package.json
func (e *NextJSExecutor) getServiceNameFromPackageJSON() string {
	type PackageJSON struct {
		Name string `json:"name"`
	}

	packageJSONPath := filepath.Join(".", "package.json")
	data, err := os.ReadFile(packageJSONPath)
	if err != nil {
		fmt.Printf("⚠️  Warning: Could not read package.json: %v, using directory name\n", err)
		// Fallback to directory name
		currentDir, _ := os.Getwd()
		return filepath.Base(currentDir)
	}

	var pkg PackageJSON
	if err := json.Unmarshal(data, &pkg); err != nil {
		fmt.Printf("⚠️  Warning: Could not parse package.json: %v, using directory name\n", err)
		// Fallback to directory name
		currentDir, _ := os.Getwd()
		return filepath.Base(currentDir)
	}

	if pkg.Name == "" {
		fmt.Printf("⚠️  Warning: package.json has no name field, using directory name\n")
		// Fallback to directory name
		currentDir, _ := os.Getwd()
		return filepath.Base(currentDir)
	}

	fmt.Printf("📦 Using service name from package.json: %s\n", pkg.Name)
	return pkg.Name
}

// GetInstrumentationPath returns the path to the instrumentation file
func (e *NextJSExecutor) GetInstrumentationPath() string {
	return e.instrumentationPath
}
