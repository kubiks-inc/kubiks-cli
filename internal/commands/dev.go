package commands

import (
	"fmt"
	"os"
	"os/exec"
	"syscall"

	tea "github.com/charmbracelet/bubbletea"

	"github.com/kubiks-inc/kubiks-cli/internal/detector"
	"github.com/kubiks-inc/kubiks-cli/pkg/types"
)

// DevCommand handles the development server command
type DevCommand struct {
	detector types.ProjectDetector
}

// NewDevCommand creates a new development command
func NewDevCommand() *DevCommand {
	return &DevCommand{
		detector: detector.NewNextJSDetector(),
	}
}

// Execute runs the development server
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

		cmd := exec.Command("npm", "run", "dev")

		// Inherit all environment variables from parent process
		cmd.Env = os.Environ()

		// Set working directory to current directory
		cmd.Dir, _ = os.Getwd()

		// Set process group for proper signal handling
		cmd.SysProcAttr = &syscall.SysProcAttr{
			Setpgid: true,
			Pgid:    0,
		}

		// Return the command to be executed with suspended UI
		return types.ExecMsg{Cmd: cmd}
	}
}

// GetCommand returns the command definition for the UI
func (c *DevCommand) GetCommand() types.Command {
	return types.Command{
		Name:        "run app",
		Description: "Run Next.js project in current directory",
		Action:      c.Execute,
	}
}
