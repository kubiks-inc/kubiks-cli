package main

import (
	"fmt"
	"os"

	tea "github.com/charmbracelet/bubbletea"

	"github.com/kubiks-inc/kubiks-cli/internal/commands"
	"github.com/kubiks-inc/kubiks-cli/internal/ui"
	"github.com/kubiks-inc/kubiks-cli/pkg/types"
)

// initializeCommands sets up all available commands
func initializeCommands() []types.Command {
	devCmd := commands.NewDevCommand()
	
	return []types.Command{
		devCmd.GetCommand(),
		{
			Name:        "exit",
			Description: "Exit the application",
			Action: func() tea.Cmd {
				return tea.Quit
			},
		},
	}
}

func main() {
	// Initialize commands
	commands := initializeCommands()
	
	// Create a new UI model
	model := ui.NewModel(commands)
	
	// Create a new Bubble Tea program
	p := tea.NewProgram(model)

	// Run the program
	if _, err := p.Run(); err != nil {
		fmt.Printf("Alas, there's been an error: %v", err)
		os.Exit(1)
	}
}