package commands

import (
	"context"
	"fmt"
	"io/fs"
	"log"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/kubiks-inc/kubiks-cli/internal/handlers"
	"github.com/kubiks-inc/kubiks-cli/internal/mcp"
	"github.com/kubiks-inc/kubiks-cli/internal/mcpconfig"
	"github.com/kubiks-inc/kubiks-cli/internal/ui"
)

// ServerCommand handles server commands (OTEL, MCP, etc.)
type ServerCommand struct {
	uiPort     string
	otelPort   string
	mcpPort    string
	mcpManager *mcpconfig.Manager
}

// NewServerCommand creates a new server command
func NewServerCommand() *ServerCommand {
	return &ServerCommand{
		uiPort:     "7431",
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

	// Clear database on each start
	fmt.Println("🧹 Clearing database on startup...")
	if err := otelServer.GetDB().ClearAll(); err != nil {
		fmt.Printf("Warning: failed to clear database on startup: %v\n", err)
	} else {
		fmt.Println("✅ Database cleared successfully")
	}

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
	otelMux.HandleFunc("/api/spans", otelServer.TracesHandler)
	otelMux.HandleFunc("/api/spans-all", otelServer.TracesAllHandler)
	otelMux.HandleFunc("/clean", otelServer.CleanHandler)

	// Create OTEL HTTP server
	otelHTTPServer := &http.Server{
		Addr:         ":" + c.otelPort,
		Handler:      otelMux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Create UI HTTP server to serve embedded React UI
	distFS, err := ui.DistFS()
	if err != nil {
		return fmt.Errorf("failed to access embedded UI: %w", err)
	}
	uiMux := http.NewServeMux()
	uiHTTPFS := http.FS(distFS)
	uiFileServer := http.FileServer(uiHTTPFS)

	// Reverse proxy to OTEL server for API routes
	targetURL, _ := url.Parse("http://localhost:" + c.otelPort)
	proxy := httputil.NewSingleHostReverseProxy(targetURL)
	uiMux.Handle("/api/", proxy)
	uiMux.Handle("/api/spans-all", proxy)
	uiMux.Handle("/clean", proxy)
	uiMux.Handle("/stats", proxy)

	uiMux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Serve static assets and index normally
		cleanPath := strings.TrimPrefix(r.URL.Path, "/")
		if cleanPath == "" || strings.HasPrefix(cleanPath, "assets/") || cleanPath == "index.html" {
			uiFileServer.ServeHTTP(w, r)
			return
		}
		if f, err := uiHTTPFS.Open(cleanPath); err == nil {
			_ = f.Close()
			uiFileServer.ServeHTTP(w, r)
			return
		}
		// SPA fallback: return embedded index.html
		indexBytes, err := fs.ReadFile(distFS, "index.html")
		if err != nil {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(indexBytes)
	})
	uiHTTPServer := &http.Server{
		Addr:         ":" + c.uiPort,
		Handler:      uiMux,
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
	fmt.Printf("🖥️  UI available at http://localhost:%s\n", c.uiPort)
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

	// Start UI HTTP server
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := uiHTTPServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("UI server failed: %v", err)
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

	// Attempt to open the UI in the default browser
	// Removed: Do not auto-open browser. We now only print the URL for the user.

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

// GetOTELPort returns the selected OTEL port
func (c *ServerCommand) GetOTELPort() string { return c.otelPort }

// GetMCPPort returns the selected MCP port
func (c *ServerCommand) GetMCPPort() string { return c.mcpPort }

func findFreePort() string {
	l, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return ""
	}
	defer l.Close()
	addr := l.Addr().(*net.TCPAddr)
	return strconv.Itoa(addr.Port)
}
