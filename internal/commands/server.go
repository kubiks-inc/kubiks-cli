package commands

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	tea "github.com/charmbracelet/bubbletea"

	"github.com/kubiks-inc/kubiks-cli/internal/handlers"
	"github.com/kubiks-inc/kubiks-cli/pkg/types"
)

// ServerCommand handles server commands (OTEL, MCP, etc.)
type ServerCommand struct {
	port string
}

// NewServerCommand creates a new server command
func NewServerCommand() *ServerCommand {
	return &ServerCommand{
		port: "7432",
	}
}

// Execute runs the HTTP server with OTEL endpoints
func (c *ServerCommand) Execute() tea.Cmd {
	return func() tea.Msg {
		if err := c.startServer(); err != nil {
			return types.CommandExecutedMsg{
				Output: "",
				Err:    fmt.Errorf("failed to start server: %w", err),
			}
		}
		return types.CommandExecutedMsg{
			Output: "Server stopped",
			Err:    nil,
		}
	}
}

// startServer starts the HTTP server directly in this process
func (c *ServerCommand) startServer() error {
	// Create server instance with database
	server, err := handlers.NewServer(c.port)
	if err != nil {
		return fmt.Errorf("failed to create server: %w", err)
	}
	defer server.Close()

	// Set up HTTP routes
	mux := http.NewServeMux()
	mux.HandleFunc("/", server.HelloHandler)
	mux.HandleFunc("/health", server.HealthHandler)
	mux.HandleFunc("/v1/logs", server.OTELLogsHandler)
	mux.HandleFunc("/v1/metrics", server.OTELMetricsHandler)
	mux.HandleFunc("/v1/traces", server.OTELTracesHandler)
	mux.HandleFunc("/stats", server.StatsHandler)

	httpServer := &http.Server{
		Addr:         ":" + c.port,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Set up graceful shutdown
	shutdownChan := make(chan struct{})
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		fmt.Println("\n🛑 Shutting down server...")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := httpServer.Shutdown(ctx); err != nil {
			log.Printf("Server shutdown error: %v", err)
		}
		close(shutdownChan)
	}()

	// Display startup information
	fmt.Printf("🚀 Kubiks Server starting on port %s...\n", c.port)
	fmt.Printf("💡 Press Ctrl+C to stop the server\n\n")

	// Start server
	go func() {
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("Server failed to start: %v", err)
			close(shutdownChan)
		}
	}()

	// Wait for shutdown signal
	<-shutdownChan
	return nil
}

// GetCommand returns the command definition for the UI
func (c *ServerCommand) GetCommand() types.Command {
	return types.Command{
		Name:        "run server",
		Description: "Start server with OTEL endpoints (logs, metrics, traces)",
		Action:      c.Execute,
	}
}
