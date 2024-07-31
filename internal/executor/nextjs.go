package executor

import (
	_ "embed"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	tea "github.com/charmbracelet/bubbletea"

	"github.com/kubiks-inc/kubiks-cli/pkg/types"
)

//go:embed instrumentation.js
var instrumentationContent string

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

// ensureInstrumentationFile creates the instrumentation.js file if it doesn't exist
func (e *NextJSExecutor) ensureInstrumentationFile() error {
	// Check if file already exists
	if _, err := os.Stat(e.instrumentationPath); err == nil {
		return nil // File already exists
	}

	// Write the embedded instrumentation file content
	return os.WriteFile(e.instrumentationPath, []byte(instrumentationContent), 0644)
}

// Execute runs the Next.js development server with OpenTelemetry instrumentation (for TUI)
func (e *NextJSExecutor) Execute() tea.Cmd {
	return func() tea.Msg {
		cmd, err := e.createCommand()
		if err != nil {
			return types.CommandExecutedMsg{
				Output: "",
				Err:    err,
			}
		}

		// Return the command to be executed with suspended UI
		return types.ExecMsg{Cmd: cmd}
	}
}

// RunDirect runs the Next.js development server directly without TUI wrapper
func (e *NextJSExecutor) RunDirect() error {
	fmt.Println("🚀 Starting Next.js development server with OpenTelemetry instrumentation...")
	fmt.Printf("📊 Instrumentation file: %s\n", e.instrumentationPath)

	cmd, err := e.createCommand()
	if err != nil {
		return err
	}

	// Connect stdio for interactive experience
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	// Run the command and wait for completion
	return cmd.Run()
}

// createCommand creates the exec.Cmd with proper NODE_OPTIONS
func (e *NextJSExecutor) createCommand() (*exec.Cmd, error) {
	// Create the command
	cmd := exec.Command("npm", "run", "dev")

	// Get current environment
	env := os.Environ()

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

	cmd.Env = env

	// Set working directory to current directory
	cmd.Dir, _ = os.Getwd()

	// Set platform-specific process attributes
	configurePlatformSpecific(cmd)

	return cmd, nil
}

// GetInstrumentationPath returns the path to the instrumentation file
func (e *NextJSExecutor) GetInstrumentationPath() string {
	return e.instrumentationPath
}
