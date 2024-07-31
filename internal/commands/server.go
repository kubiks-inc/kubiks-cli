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

	"github.com/kubiks-inc/kubiks-cli/internal/handlers"
	"github.com/kubiks-inc/kubiks-cli/internal/mcp"
	"github.com/kubiks-inc/kubiks-cli/internal/mcpconfig"
)

// ServerCommand handles server commands (OTEL, MCP, etc.)
type ServerCommand struct {
	otelPort   string
	mcpPort    string
	mcpManager *mcpconfig.Manager
}

// NewServerCommand creates a new server command
func NewServerCommand() *ServerCommand {
	return &ServerCommand{
		otelPort:   "7432",
		mcpPort:    "7433",
		mcpManager: mcpconfig.NewManager(),
	}
}

// RunDirect runs the server directly without TUI wrapper
func (c *ServerCommand) RunDirect() error {
	return c.startServer()
}

// startServer starts both OTEL HTTP and MCP servers on separate ports
func (c *ServerCommand) startServer() error {
	// Setup MCP configuration
	if err := c.mcpManager.AddKubiksServer(); err != nil {
		fmt.Printf("Warning: failed to configure MCP server: %v\n", err)
	}

	// Create server instance with database
	otelServer, err := handlers.NewServer(c.otelPort)
	if err != nil {
		return fmt.Errorf("failed to create OTEL server: %w", err)
	}
	defer otelServer.Close()

	// Create MCP server with shared database
	mcpServer, err := mcp.NewMCPServer(otelServer.GetDB(), c.mcpPort)
	if err != nil {
		return fmt.Errorf("failed to create MCP server: %w", err)
	}
	defer mcpServer.Close()

	// Set up OTEL HTTP routes
	otelMux := http.NewServeMux()
	otelMux.HandleFunc("/", otelServer.HelloHandler)
	otelMux.HandleFunc("/health", otelServer.HealthHandler)
	otelMux.HandleFunc("/v1/logs", otelServer.OTELLogsHandler)
	otelMux.HandleFunc("/v1/metrics", otelServer.OTELMetricsHandler)
	otelMux.HandleFunc("/v1/traces", otelServer.OTELTracesHandler)
	otelMux.HandleFunc("/stats", otelServer.StatsHandler)

	// Create OTEL HTTP server
	otelHTTPServer := &http.Server{
		Addr:         ":" + c.otelPort,
		Handler:      otelMux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Create MCP HTTP server
	mcpHTTPServer, err := mcpServer.StartStandalone()
	if err != nil {
		return fmt.Errorf("failed to create MCP HTTP server: %w", err)
	}

	// Set up graceful shutdown
	shutdownChan := make(chan struct{})
	var shutdownOnce sync.Once // Ensure shutdown is triggered only once
	var wg sync.WaitGroup

	// Function to trigger shutdown safely
	triggerShutdown := func() {
		shutdownOnce.Do(func() {
			close(shutdownChan)
		})
	}

	// Signal handler goroutine
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		fmt.Println("\n🛑 Shutting down servers...")

		// Clean up MCP configuration
		fmt.Println("🧹 Cleaning up MCP configuration...")
		if err := c.mcpManager.RemoveKubiksServer(); err != nil {
			fmt.Printf("Warning: failed to clean up MCP configuration: %v\n", err)
		}

		// Create a channel to track shutdown completion
		shutdownDone := make(chan struct{})

		go func() {
			// Graceful shutdown for OTEL server only
			gracefulCtx, gracefulCancel := context.WithTimeout(context.Background(), 3*time.Second)
			defer gracefulCancel()

			// Try graceful shutdown of OTEL server
			otelErr := otelHTTPServer.Shutdown(gracefulCtx)
			if otelErr != nil {
				// Force close OTEL server if graceful failed
				otelHTTPServer.Close()
			}

			// Force close MCP server immediately (SSE connections don't close gracefully)
			mcpHTTPServer.Close()

			close(shutdownDone)
		}()

		// Wait for shutdown to complete with overall timeout
		overallTimeout := time.NewTimer(5 * time.Second)
		defer overallTimeout.Stop()

		select {
		case <-shutdownDone:
			// Silent completion
		case <-overallTimeout.C:
			log.Printf("Shutdown timeout exceeded")
		}

		triggerShutdown()
	}()

	// Display startup information
	fmt.Printf("🚀 Kubiks Servers starting...\n")
	fmt.Printf("📡 OpenTelemetry server running on http://localhost:%s\n", c.otelPort)
	fmt.Printf("🔗 MCP server running on http://localhost:%s/mcp/sse\n", c.mcpPort)
	fmt.Printf("💡 Press Ctrl+C to stop the servers\n\n")

	// Start OTEL HTTP server
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := otelHTTPServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("OTEL server failed: %v", err)
			triggerShutdown()
		}
	}()

	// Start MCP HTTP server
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := mcpHTTPServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("MCP server failed: %v", err)
			triggerShutdown()
		}
	}()

	// Wait for shutdown signal
	<-shutdownChan

	// Wait for servers to finish shutting down
	wg.Wait()

	// Clean up MCP configuration on normal exit
	if err := c.mcpManager.RemoveKubiksServer(); err != nil {
		fmt.Printf("Warning: failed to clean up MCP configuration: %v\n", err)
	}

	return nil
}
