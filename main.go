package main

import (
	"fmt"
	"os"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/spf13/cobra"

	"github.com/kubiks-inc/kubiks-cli/internal/commands"
	"github.com/kubiks-inc/kubiks-cli/internal/ui"
	"github.com/kubiks-inc/kubiks-cli/pkg/types"
)

// initializeCommands sets up all available commands for TUI
func initializeCommands() []types.Command {
	devCmd := commands.NewDevCommand()
	serverCmd := commands.NewServerCommand()

	return []types.Command{
		devCmd.GetCommand(),
		serverCmd.GetCommand(),
		{
			Name:        "exit",
			Description: "Exit the application",
			Action: func() tea.Cmd {
				return tea.Quit
			},
		},
	}
}

// runTUI starts the interactive terminal UI
func runTUI() error {
	// Initialize commands
	commands := initializeCommands()

	// Create a new UI model
	model := ui.NewModel(commands)

	// Create a new Bubble Tea program
	p := tea.NewProgram(model)

	// Run the program
	if _, err := p.Run(); err != nil {
		return fmt.Errorf("TUI error: %v", err)
	}
	return nil
}

func main() {
	var rootCmd = &cobra.Command{
		Use:   "kubiks",
		Short: "Kubiks CLI - OpenTelemetry and development server management",
		Long:  `Kubiks CLI provides tools for managing OpenTelemetry data and development servers`,
		Run: func(cmd *cobra.Command, args []string) {
			// Default behavior: run TUI when no subcommands are provided
			if err := runTUI(); err != nil {
				fmt.Printf("Error: %v\n", err)
				os.Exit(1)
			}
		},
	}

	// Create run command group
	var runCmd = &cobra.Command{
		Use:   "run",
		Short: "Run various services",
		Long:  `Run different services like the server or development environment`,
	}

	// Add server command
	var serverCmd = &cobra.Command{
		Use:   "server",
		Short: "Start the OTEL and MCP servers",
		Long:  `Start the OpenTelemetry and MCP servers for data collection and processing`,
		Run: func(cmd *cobra.Command, args []string) {
			serverCommand := commands.NewServerCommand()
			if err := serverCommand.RunDirect(); err != nil {
				fmt.Printf("Error starting server: %v\n", err)
				os.Exit(1)
			}
		},
	}

	// Add nextjs command
	var nextjsCmd = &cobra.Command{
		Use:   "nextjs",
		Short: "Start the Next.js development server with OpenTelemetry",
		Long:  `Start the Next.js development server with OpenTelemetry instrumentation for the current project`,
		Run: func(cmd *cobra.Command, args []string) {
			devCommand := commands.NewDevCommand()
			if err := devCommand.RunDirect(); err != nil {
				fmt.Printf("Error starting Next.js dev server: %v\n", err)
				os.Exit(1)
			}
		},
	}

	// Add commands to run group
	runCmd.AddCommand(serverCmd)
	runCmd.AddCommand(nextjsCmd)

	// Add run command to root
	rootCmd.AddCommand(runCmd)

	// Execute the root command
	if err := rootCmd.Execute(); err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
}
