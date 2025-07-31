package commands

import (
	"fmt"

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
