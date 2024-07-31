package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"

	"github.com/kubiks-inc/kubiks-cli/internal/commands"
)



func main() {
	var rootCmd = &cobra.Command{
		Use:   "kubiks",
		Short: "Kubiks CLI - OpenTelemetry and development server management",
		Long:  `Kubiks CLI provides tools for managing OpenTelemetry data and development servers`,
		Run: func(cmd *cobra.Command, args []string) {
			// Default behavior: show help when no subcommands are provided
			cmd.Help()
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
