package types

import (
	"os/exec"

	tea "github.com/charmbracelet/bubbletea"
)

// Command represents a CLI command that can be executed
type Command struct {
	Name        string
	Description string
	Action      func() tea.Cmd
}

// CommandExecutedMsg is sent when a command finishes executing
type CommandExecutedMsg struct {
	Output string
	Err    error
}

// ExecMsg tells the UI to suspend and run a command
type ExecMsg struct {
	Cmd *exec.Cmd
}

// ProjectDetector interface for detecting project types
type ProjectDetector interface {
	IsSupported() (bool, error)
	GetProjectType() string
}