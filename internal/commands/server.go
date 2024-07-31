package commands

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	tea "github.com/charmbracelet/bubbletea"

	"github.com/kubiks-inc/kubiks-cli/internal/handlers"
	"github.com/kubiks-inc/kubiks-cli/internal/mcp"
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

// startServer starts both HTTP and MCP servers
func (c *ServerCommand) startServer() error {
	// Create server instance with database
	server, err := handlers.NewServer(c.port)
	if err != nil {
		return fmt.Errorf("failed to create server: %w", err)
	}
	defer server.Close()

	// Create MCP server with shared database
	mcpServer, err := mcp.NewMCPServer(server.GetDB(), c.port)
	if err != nil {
		return fmt.Errorf("failed to create MCP server: %w", err)
	}
	defer mcpServer.Close()

	// Set up HTTP routes
	mux := http.NewServeMux()
	mux.HandleFunc("/", server.HelloHandler)
	mux.HandleFunc("/health", server.HealthHandler)
	mux.HandleFunc("/v1/logs", server.OTELLogsHandler)
	mux.HandleFunc("/v1/metrics", server.OTELMetricsHandler)
	mux.HandleFunc("/v1/traces", server.OTELTracesHandler)
	mux.HandleFunc("/stats", server.StatsHandler)

	// Initialize MCP server endpoints
	if err := mcpServer.Start(); err != nil {
		return fmt.Errorf("failed to start MCP server: %w", err)
	}

	httpServer := &http.Server{
		Addr:         ":" + c.port,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Set up graceful shutdown
	shutdownChan := make(chan struct{})
	var wg sync.WaitGroup

	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		fmt.Println("\n🛑 Shutting down servers...")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := httpServer.Shutdown(ctx); err != nil {
			log.Printf("HTTP server shutdown error: %v", err)
		}
		
		close(shutdownChan)
	}()

	// Display startup information
	fmt.Printf("🚀 Kubiks Server starting on port %s...\n", c.port)
	fmt.Printf("📡 OpenTelemetry server running on http://localhost:%s\n", c.port)
	fmt.Printf("🔗 MCP server running on http://localhost:%s/mcp/sse\n", c.port)
	fmt.Printf("💡 Press Ctrl+C to stop the servers\n\n")

	// Start HTTP server (MCP endpoints are now part of HTTP server)
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("HTTP server failed: %v", err)
			close(shutdownChan)
		}
	}()

	// Wait for shutdown signal
	<-shutdownChan
	
	// Wait for servers to finish shutting down
	wg.Wait()
	
	return nil
}

// GetCommand returns the command definition for the UI
func (c *ServerCommand) GetCommand() types.Command {
	return types.Command{
		Name:        "run server",
		Description: "Start server with OTEL endpoints and MCP server (logs, metrics, traces)",
		Action:      c.Execute,
	}
}
