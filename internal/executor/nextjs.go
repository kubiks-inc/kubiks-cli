package executor

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net/url"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/kubiks-inc/kubiks-cli/internal/database"
	"github.com/kubiks-inc/kubiks-cli/pkg/types"
)

// NextJSExecutor handles execution of Next.js applications with OpenTelemetry environment configuration
type NextJSExecutor struct {
	// No instrumentation path needed anymore
}

// NewNextJSExecutor creates a new Next.js executor
func NewNextJSExecutor() (*NextJSExecutor, error) {
	return &NextJSExecutor{}, nil
}

// RunDirect runs the Next.js development server directly without TUI wrapper
func (e *NextJSExecutor) RunDirect() error {
	// Pre-validate the environment
	if err := e.validateEnvironment(); err != nil {
		return err
	}

	serviceName := e.getServiceNameFromPackageJSON()
	fmt.Println("🚀 Starting Next.js development server with OpenTelemetry environment configuration...")
	fmt.Printf("🏷️  Service name: %s\n", serviceName)

	// Resolve exporter endpoint and protocol from project .env files
	resolvedEndpoint, resolvedProtocol := e.resolveExporterConfig()
	fmt.Printf("🔗 OTEL Endpoint: %s\n", resolvedEndpoint)
	fmt.Printf("📡 OTEL Protocol: %s\n", resolvedProtocol)

	// Warn if using an external collector (non-localhost)
	if u, err := url.Parse(resolvedEndpoint); err == nil {
		host := u.Hostname()
		if host != "localhost" && host != "127.0.0.1" && host != "" {
			fmt.Println("⚠️  Using external collector; local Kubiks UI will not display remote spans unless the data is also ingested locally.")
		}
	}

	// Warn if endpoint likely missing OTLP HTTP path
	if !strings.Contains(resolvedEndpoint, "/v1/") {
		fmt.Println("⚠️  The OTEL endpoint may be missing the OTLP HTTP path. Example: http://host:4318/v1/traces")
	}

	cmd, err := e.createCommand()
	if err != nil {
		return err
	}

	// Intercept stdout/stderr so we can mirror to console and store raw lines in DB
	cmd.Stdin = os.Stdin
	stdoutPipe, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("failed to get stdout pipe: %w", err)
	}
	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("failed to get stderr pipe: %w", err)
	}

	// Open the shared database to store raw log lines
	db, err := database.NewDB(types.GetDatabasePath())
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	// Set up signal handling for graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Start the command
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start command: %w", err)
	}

	// Render a simple banner with the Web Interface URL
	fmt.Println()
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Println(" Kubiks Dev is running")
	fmt.Println()
	fmt.Println(" Web Interface:")
	fmt.Println("  • http://localhost:7431")
	fmt.Println()
	fmt.Println(" Press Ctrl+C to stop.")
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

	// Handle signals and command completion concurrently
	go func() {
		<-sigChan
		fmt.Println("\n🛑 Shutting down Next.js development server...")

		// Kill the entire process group to ensure all child processes are terminated
		if err := killProcessGroup(cmd.Process.Pid); err != nil {
			fmt.Printf("Warning: failed to kill process group: %v\n", err)
		}
	}()

	// Start goroutines to read and persist stdout/stderr lines
	writeRawLog := func(line, stream string) {
		// Mirror to console first
		if stream == "STDERR" {
			fmt.Fprintln(os.Stderr, line)
		} else {
			fmt.Fprintln(os.Stdout, line)
		}

		// Build a minimal JSON log record without parsing the line contents
		logRecord := map[string]interface{}{
			"timeUnixNano":       strconv.FormatInt(time.Now().UnixNano(), 10),
			"severityText":       stream,
			"severityNumber":     0,
			"body":               line,
			"attributes":         map[string]interface{}{},
			"resourceAttributes": map[string]interface{}{"service.name": serviceName},
		}
		bytes, mErr := json.Marshal(logRecord)
		if mErr != nil {
			return
		}
		// Store with unknown trace ID; service name will be extracted from resourceAttributes
		_, _ = db.InsertLog("unknown", string(bytes))
	}

	go func() {
		scanner := bufio.NewScanner(stdoutPipe)
		scanner.Buffer(make([]byte, 0, 1024), 1024*1024)
		for scanner.Scan() {
			writeRawLog(scanner.Text(), "STDOUT")
		}
	}()
	go func() {
		scanner := bufio.NewScanner(stderrPipe)
		scanner.Buffer(make([]byte, 0, 1024), 1024*1024)
		for scanner.Scan() {
			writeRawLog(scanner.Text(), "STDERR")
		}
	}()

	// Wait for the command to complete
	err = cmd.Wait()

	// Stop listening for signals
	signal.Stop(sigChan)
	close(sigChan)

	return err
}

// createCommand creates the exec.Cmd with proper OpenTelemetry environment variables
func (e *NextJSExecutor) createCommand() (*exec.Cmd, error) {
	// Create the command
	cmd := exec.Command("npm", "run", "dev")

	// Get current environment
	env := os.Environ()

	// Resolve exporter configuration (from .env files) and set env vars
	endpoint, protocol := e.resolveExporterConfig()

	// Set OpenTelemetry environment variables
	env = append(env, "OTEL_EXPORTER_OTLP_ENDPOINT="+endpoint)
	env = append(env, "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="+endpoint)
	env = append(env, "OTEL_EXPORTER_OTLP_PROTOCOL="+protocol)

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

// resolveExporterConfig returns the OTLP exporter endpoint and protocol.
// Precedence (first match wins): .env.local, then .env. Fallbacks to local collector.
func (e *NextJSExecutor) resolveExporterConfig() (string, string) {
	defaultEndpoint := "http://localhost:7432/v1/traces"
	defaultProtocol := "http/json"

	vals := e.loadDotEnvFiles([]string{".env.local", ".env"})

	endpoint := vals["OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"]
	if endpoint == "" {
		endpoint = vals["OTEL_EXPORTER_OTLP_ENDPOINT"]
	}
	if endpoint == "" {
		endpoint = defaultEndpoint
	}

	protocol := vals["OTEL_EXPORTER_OTLP_PROTOCOL"]
	if protocol == "" {
		protocol = defaultProtocol
	}

	return endpoint, protocol
}

// loadDotEnvFiles parses simple KEY=VALUE lines from the provided files in order.
// Earlier files take precedence (do not get overridden by later files).
func (e *NextJSExecutor) loadDotEnvFiles(files []string) map[string]string {
	values := make(map[string]string)

	setIfEmpty := func(k, v string) {
		if k == "" || v == "" {
			return
		}
		if _, exists := values[k]; !exists {
			values[k] = v
		}
	}

	for _, name := range files {
		data, err := os.ReadFile(filepath.Join(".", name))
		if err != nil {
			continue
		}
		lines := strings.Split(string(data), "\n")
		for _, line := range lines {
			line = strings.TrimSpace(line)
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			if strings.HasPrefix(line, "export ") {
				line = strings.TrimSpace(strings.TrimPrefix(line, "export "))
			}
			idx := strings.Index(line, "=")
			if idx <= 0 {
				continue
			}
			k := strings.TrimSpace(line[:idx])
			v := strings.TrimSpace(line[idx+1:])
			if len(v) >= 2 {
				if (strings.HasPrefix(v, "\"") && strings.HasSuffix(v, "\"")) || (strings.HasPrefix(v, "'") && strings.HasSuffix(v, "'")) {
					v = v[1 : len(v)-1]
				}
			}
			setIfEmpty(k, v)
		}
	}

	return values
}
