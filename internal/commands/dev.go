package commands

import (
	"fmt"

	tea "github.com/charmbracelet/bubbletea"

	"github.com/kubiks-inc/kubiks-cli/internal/detector"
	"github.com/kubiks-inc/kubiks-cli/internal/executor"
	"github.com/kubiks-inc/kubiks-cli/pkg/types"
)

// DevCommand handles the development server command
type DevCommand struct {
	detector types.ProjectDetector
	executor *executor.NextJSExecutor
}

// NewDevCommand creates a new development command
func NewDevCommand() *DevCommand {
	executor, err := executor.NewNextJSExecutor()
	if err != nil {
		// Log the error but don't fail the command creation
		// The error will be handled when actually trying to execute
		fmt.Printf("Warning: failed to initialize NextJS executor: %v\n", err)
	}

	return &DevCommand{
		detector: detector.NewNextJSDetector(),
		executor: executor,
	}
}

// Execute runs the development server (for TUI)
func (c *DevCommand) Execute() tea.Cmd {
	return func() tea.Msg {
		// Check if this is a supported project
		isSupported, err := c.detector.IsSupported()
		if !isSupported {
			return types.CommandExecutedMsg{
				Output: "",
				Err:    fmt.Errorf("only %s applications are supported. %v", c.detector.GetProjectType(), err),
			}
		}

		// Check if executor is available
		if c.executor == nil {
			return types.CommandExecutedMsg{
				Output: "",
				Err:    fmt.Errorf("NextJS executor not initialized"),
			}
		}

		// Use the executor to run the command
		return c.executor.Execute()()
	}
}

// RunDirect runs the development server directly without TUI wrapper
func (c *DevCommand) RunDirect() error {
	// Check if this is a supported project
	isSupported, err := c.detector.IsSupported()
	if !isSupported {
		return fmt.Errorf("only %s applications are supported. %v", c.detector.GetProjectType(), err)
	}

	// Check if executor is available
	if c.executor == nil {
		return fmt.Errorf("NextJS executor not initialized")
	}

	// Use the executor to run the command
	return c.executor.RunDirect()
}

// GetCommand returns the command definition for the UI
func (c *DevCommand) GetCommand() types.Command {
	return types.Command{
		Name:        "run app",
		Description: "Run Next.js project with OpenTelemetry instrumentation",
		Action:      c.Execute,
	}
}
