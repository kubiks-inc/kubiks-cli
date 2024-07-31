package main

import (
	"fmt"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/spf13/cobra"

	"github.com/kubiks-inc/kubiks-cli/internal/commands"
	"github.com/kubiks-inc/kubiks-cli/internal/mcpconfig"
)

func main() {
	var rootCmd = &cobra.Command{
		Use:   "kubiks",
		Short: "Kubiks CLI - OpenTelemetry and development server management",
		Long:  `Kubiks CLI provides tools for managing OpenTelemetry data and development servers`,
		Run: func(cmd *cobra.Command, args []string) {
			// Default behavior: start both server and NextJS
			fmt.Println("🚀 Starting Kubiks with server and NextJS...")

			// Setup MCP configuration
			mcpManager := mcpconfig.NewManager()
			if err := mcpManager.AddKubiksServer(); err != nil {
				fmt.Printf("Warning: failed to configure MCP server: %v\n", err)
			}

			// Setup cleanup on exit
			setupCleanupHandler(mcpManager)

			var wg sync.WaitGroup
			errChan := make(chan error, 2)

			// Start server in goroutine
			wg.Add(1)
			go func() {
				defer wg.Done()
				serverCommand := commands.NewServerCommand()
				if err := serverCommand.RunDirect(); err != nil {
					errChan <- fmt.Errorf("server error: %v", err)
				}
			}()

			// Start NextJS in goroutine
			wg.Add(1)
			go func() {
				defer wg.Done()
				devCommand := commands.NewDevCommand()
				if err := devCommand.RunDirect(); err != nil {
					errChan <- fmt.Errorf("NextJS error: %v", err)
				}
			}()

			// Wait for any error or completion
			go func() {
				wg.Wait()
				close(errChan)
			}()

			// Check for errors
			if err := <-errChan; err != nil {
				fmt.Printf("Error: %v\n", err)
				cleanupMCP(mcpManager)
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
			// Setup MCP configuration
			mcpManager := mcpconfig.NewManager()
			if err := mcpManager.AddKubiksServer(); err != nil {
				fmt.Printf("Warning: failed to configure MCP server: %v\n", err)
			}

			// Setup cleanup on exit
			setupCleanupHandler(mcpManager)

			serverCommand := commands.NewServerCommand()
			if err := serverCommand.RunDirect(); err != nil {
				fmt.Printf("Error starting server: %v\n", err)
				cleanupMCP(mcpManager)
				os.Exit(1)
			}

			// Clean up on normal exit
			cleanupMCP(mcpManager)
		},
	}

	// Add nextjs command
	var nextjsCmd = &cobra.Command{
		Use:   "nextjs",
		Short: "Start the Next.js development server with OpenTelemetry",
		Long:  `Start the Next.js development server with OpenTelemetry instrumentation for the current project`,
		Run: func(cmd *cobra.Command, args []string) {
			// Setup cleanup on exit (for nextjs-only mode, we don't add MCP config since server isn't running)
			mcpManager := mcpconfig.NewManager()
			setupCleanupHandler(mcpManager)

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

// setupCleanupHandler sets up signal handlers for graceful shutdown
func setupCleanupHandler(mcpManager *mcpconfig.Manager) {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sigChan
		fmt.Println("\n🧹 Cleaning up MCP configuration...")
		cleanupMCP(mcpManager)
		os.Exit(0)
	}()
}

// cleanupMCP removes the kubiks server from MCP configuration
func cleanupMCP(mcpManager *mcpconfig.Manager) {
	if err := mcpManager.RemoveKubiksServer(); err != nil {
		fmt.Printf("Warning: failed to clean up MCP configuration: %v\n", err)
	}
}
