package mcp

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/kubiks-inc/kubiks-cli/internal/database"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

// KubiksMCP represents the MCP server
type KubiksMCP struct {
	McpServer *server.MCPServer
	db        *database.DB
	port      string
}

// NewMCPServer creates a new MCP server instance
func NewMCPServer(db *database.DB, port string) (*KubiksMCP, error) {
	mcpServer := server.NewMCPServer(
		"kubiks-cli",
		"1.0.0",
		server.WithResourceCapabilities(true, true),
		server.WithLogging(),
		server.WithRecovery(),
	)

	kubiksMCP := &KubiksMCP{
		McpServer: mcpServer,
		db:        db,
		port:      port,
	}

	// Add tools
	kubiksMCP.registerTools()

	return kubiksMCP, nil
}

// Start starts the MCP server with HTTP/SSE transport and registers handlers on the provided mux
func (s *KubiksMCP) Start(mux *http.ServeMux) error {
	fmt.Printf("🔗 MCP server starting on port %s...\n", s.port)

	sseServer := server.NewSSEServer(
		s.McpServer,
		server.WithBasePath("/mcp"),
		server.WithSSEEndpoint("/sse"),
		server.WithMessageEndpoint("/message"),
	)

	// Wrap handlers with CORS middleware
	mux.Handle("/mcp/sse", s.corsMiddleware(sseServer.SSEHandler()))
	mux.Handle("/mcp/message", s.corsMiddleware(sseServer.MessageHandler()))

	// Add direct HTTP endpoints for simple tool calls
	mux.Handle("/api/logs", s.corsMiddleware(http.HandlerFunc(s.httpGetLogs)))
	mux.Handle("/api/traces", s.corsMiddleware(http.HandlerFunc(s.httpGetTraces)))
	mux.Handle("/api/metrics", s.corsMiddleware(http.HandlerFunc(s.httpGetMetrics)))

	fmt.Printf("🔗 MCP server listening on http://localhost:%s/mcp/sse\n", s.port)
	fmt.Printf("🔗 Direct API endpoints: /api/logs, /api/traces, /api/metrics\n")
	return nil
}

// StartStandalone starts the MCP server on its own HTTP server instance
func (s *KubiksMCP) StartStandalone() (*http.Server, error) {
	fmt.Printf("🔗 MCP server starting on port %s...\n", s.port)

	mux := http.NewServeMux()

	sseServer := server.NewSSEServer(
		s.McpServer,
		server.WithBasePath("/mcp"),
		server.WithSSEEndpoint("/sse"),
		server.WithMessageEndpoint("/message"),
	)

	// Wrap handlers with CORS middleware
	mux.Handle("/mcp/sse", s.corsMiddleware(sseServer.SSEHandler()))
	mux.Handle("/mcp/message", s.corsMiddleware(sseServer.MessageHandler()))

	// Add direct HTTP endpoints for simple tool calls
	mux.Handle("/api/logs", s.corsMiddleware(http.HandlerFunc(s.httpGetLogs)))
	mux.Handle("/api/traces", s.corsMiddleware(http.HandlerFunc(s.httpGetTraces)))
	mux.Handle("/api/metrics", s.corsMiddleware(http.HandlerFunc(s.httpGetMetrics)))

	httpServer := &http.Server{
		Addr:         ":" + s.port,
		Handler:      mux,
		ReadTimeout:  30 * time.Second,  // Increased for SSE connections
		WriteTimeout: 30 * time.Second,  // Increased for SSE connections
		IdleTimeout:  300 * time.Second, // Increased for long-lived SSE connections
	}

	fmt.Printf("🔗 MCP server listening on http://localhost:%s/mcp/sse\n", s.port)
	return httpServer, nil
}

// registerTools registers all MCP tools
func (s *KubiksMCP) registerTools() {
	// Register get_logs tool
	s.McpServer.AddTool(s.getLogsTool(), s.handleGetLogs)

	// Register get_traces tool
	s.McpServer.AddTool(s.getTracesTool(), s.handleGetTraces)

	// Register get_metrics tool
	s.McpServer.AddTool(s.getMetricsTool(), s.handleGetMetrics)
}

// getLogsTool returns the logs tool definition
func (s *KubiksMCP) getLogsTool() mcp.Tool {
	return mcp.Tool{
		Name:        "get_logs",
		Description: "Fetch OTEL logs from kubiks-cli, a Cursor debugging tool that automatically instruments Next.js projects. Use this tool to retrieve detailed application logs and runtime information when users report issues with their Next.js applications or when debugging problems with code changes made by Cursor. The logs contain valuable debugging information including errors, warnings, and application flow data.",
		InputSchema: mcp.ToolInputSchema{
			Type: "object",
			Properties: map[string]interface{}{
				"limit": map[string]interface{}{
					"type":        "number",
					"description": "Number of logs to fetch (default: 10, max: 100)",
				},
				"offset": map[string]interface{}{
					"type":        "number",
					"description": "Number of logs to skip (default: 0)",
				},
			},
		},
	}
}

// getTracesTool returns the traces tool definition
func (s *KubiksMCP) getTracesTool() mcp.Tool {
	return mcp.Tool{
		Name:        "get_traces",
		Description: "Fetch OTEL traces from kubiks-cli, a Cursor debugging tool that automatically instruments Next.js projects. Use this tool to retrieve distributed tracing data showing request flows, function calls, and performance bottlenecks in Next.js applications. Essential for debugging issues with user code changes, identifying slow components, API call chains, and understanding application execution paths when troubleshooting problems reported by users.",
		InputSchema: mcp.ToolInputSchema{
			Type: "object",
			Properties: map[string]interface{}{
				"limit": map[string]interface{}{
					"type":        "number",
					"description": "Number of traces to fetch (default: 10, max: 100)",
				},
				"offset": map[string]interface{}{
					"type":        "number",
					"description": "Number of traces to skip (default: 0)",
				},
			},
		},
	}
}

// getMetricsTool returns the metrics tool definition
func (s *KubiksMCP) getMetricsTool() mcp.Tool {
	return mcp.Tool{
		Name:        "get_metrics",
		Description: "Fetch OTEL metrics from kubiks-cli, a Cursor debugging tool that automatically instruments Next.js projects. Use this tool to retrieve performance metrics, resource usage data, and application health indicators from Next.js applications. Critical for analyzing performance issues, memory usage, request rates, response times, and other quantitative data when users experience problems with code changes or application performance after Cursor modifications.",
		InputSchema: mcp.ToolInputSchema{
			Type: "object",
			Properties: map[string]interface{}{
				"limit": map[string]interface{}{
					"type":        "number",
					"description": "Number of metrics to fetch (default: 10, max: 100)",
				},
				"offset": map[string]interface{}{
					"type":        "number",
					"description": "Number of metrics to skip (default: 0)",
				},
			},
		},
	}
}

// handleGetLogs handles the get_logs tool call
func (s *KubiksMCP) handleGetLogs(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	limit := 10
	offset := 0

	if request.Params.Arguments != nil {
		if args, ok := request.Params.Arguments.(map[string]interface{}); ok {
			if l, ok := args["limit"].(float64); ok {
				limit = int(l)
				if limit > 100 {
					limit = 100
				}
			}

			if o, ok := args["offset"].(float64); ok {
				offset = int(o)
			}
		} else {
			log.Printf("[MCP] ERROR: Failed to parse arguments as map[string]interface{}")
		}
	}

	logs, err := s.db.GetLogsPaginated(limit, offset)
	if err != nil {
		log.Printf("[MCP] ERROR: Database error while fetching logs: %v", err)
		return &mcp.CallToolResult{
			Content: []mcp.Content{mcp.TextContent{
				Type: "text",
				Text: fmt.Sprintf("Database error: %v", err),
			}},
			IsError: true,
		}, nil
	}

	// Return JSON data from logs
	var jsonData []string
	for _, logEntry := range logs {
		jsonData = append(jsonData, logEntry.Data)
	}

	return &mcp.CallToolResult{
		Content: []mcp.Content{mcp.TextContent{
			Type: "text",
			Text: strings.Join(jsonData, "\n"),
		}},
		IsError: false,
	}, nil
}

// handleGetTraces handles the get_traces tool call
func (s *KubiksMCP) handleGetTraces(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	limit := 10
	offset := 0

	if request.Params.Arguments != nil {
		if args, ok := request.Params.Arguments.(map[string]interface{}); ok {
			if l, ok := args["limit"].(float64); ok {
				limit = int(l)
				if limit > 100 {
					limit = 100
				}
			}

			if o, ok := args["offset"].(float64); ok {
				offset = int(o)
			}
		} else {
			log.Printf("[MCP] ERROR: Failed to parse arguments as map[string]interface{}")
		}
	}

	traces, err := s.db.GetTracesPaginated(limit, offset)
	if err != nil {
		log.Printf("[MCP] ERROR: Database error while fetching traces: %v", err)
		return &mcp.CallToolResult{
			Content: []mcp.Content{mcp.TextContent{
				Type: "text",
				Text: fmt.Sprintf("Database error: %v", err),
			}},
			IsError: true,
		}, nil
	}

	// Return JSON data from traces
	var jsonData []string
	for _, trace := range traces {
		jsonData = append(jsonData, trace.Data)
	}

	return &mcp.CallToolResult{
		Content: []mcp.Content{mcp.TextContent{
			Type: "text",
			Text: strings.Join(jsonData, "\n"),
		}},
		IsError: false,
	}, nil
}

// handleGetMetrics handles the get_metrics tool call
func (s *KubiksMCP) handleGetMetrics(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	limit := 10
	offset := 0

	if request.Params.Arguments != nil {
		if args, ok := request.Params.Arguments.(map[string]interface{}); ok {
			if l, ok := args["limit"].(float64); ok {
				limit = int(l)
				if limit > 100 {
					limit = 100
				}
			}

			if o, ok := args["offset"].(float64); ok {
				offset = int(o)
			}
		} else {
			log.Printf("[MCP] ERROR: Failed to parse arguments as map[string]interface{}")
		}
	}

	metrics, err := s.db.GetMetricsPaginated(limit, offset)
	if err != nil {
		log.Printf("[MCP] ERROR: Database error while fetching metrics: %v", err)
		return &mcp.CallToolResult{
			Content: []mcp.Content{mcp.TextContent{
				Type: "text",
				Text: fmt.Sprintf("Database error: %v", err),
			}},
			IsError: true,
		}, nil
	}

	// Return JSON data from metrics
	var jsonData []string
	for _, metric := range metrics {
		jsonData = append(jsonData, metric.Data)
	}

	return &mcp.CallToolResult{
		Content: []mcp.Content{mcp.TextContent{
			Type: "text",
			Text: strings.Join(jsonData, "\n"),
		}},
		IsError: false,
	}, nil
}

// corsMiddleware adds CORS headers for cross-origin requests
func (s *KubiksMCP) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cache-Control")
		w.Header().Set("Access-Control-Expose-Headers", "Content-Type")

		// Handle preflight OPTIONS request
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Set SSE-specific headers for /mcp/sse endpoint
		if strings.HasSuffix(r.URL.Path, "/sse") {
			w.Header().Set("Content-Type", "text/event-stream")
			w.Header().Set("Cache-Control", "no-cache")
			w.Header().Set("Connection", "keep-alive")
			w.Header().Set("X-Accel-Buffering", "no") // Disable nginx buffering
		}

		next.ServeHTTP(w, r)
	})
}

// httpGetLogs handles GET /api/logs requests
func (s *KubiksMCP) httpGetLogs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Parse query parameters
	limit := 10
	offset := 0

	if l := r.URL.Query().Get("limit"); l != "" {
		if parsedLimit, err := strconv.Atoi(l); err == nil {
			limit = parsedLimit
			if limit > 100 {
				limit = 100
			}
		}
	}

	if o := r.URL.Query().Get("offset"); o != "" {
		if parsedOffset, err := strconv.Atoi(o); err == nil {
			offset = parsedOffset
		}
	}

	logs, err := s.db.GetLogsPaginated(limit, offset)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Database error: %v"}`, err), http.StatusInternalServerError)
		return
	}

	// Return logs as JSON array
	w.Write([]byte("["))
	for i, logEntry := range logs {
		if i > 0 {
			w.Write([]byte(","))
		}
		w.Write([]byte(logEntry.Data))
	}
	w.Write([]byte("]"))
}

// httpGetTraces handles GET /api/traces requests
func (s *KubiksMCP) httpGetTraces(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Parse query parameters
	limit := 10
	offset := 0

	if l := r.URL.Query().Get("limit"); l != "" {
		if parsedLimit, err := strconv.Atoi(l); err == nil {
			limit = parsedLimit
			if limit > 100 {
				limit = 100
			}
		}
	}

	if o := r.URL.Query().Get("offset"); o != "" {
		if parsedOffset, err := strconv.Atoi(o); err == nil {
			offset = parsedOffset
		}
	}

	traces, err := s.db.GetTracesPaginated(limit, offset)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Database error: %v"}`, err), http.StatusInternalServerError)
		return
	}

	// Return traces as JSON array
	w.Write([]byte("["))
	for i, trace := range traces {
		if i > 0 {
			w.Write([]byte(","))
		}
		w.Write([]byte(trace.Data))
	}
	w.Write([]byte("]"))
}

// httpGetMetrics handles GET /api/metrics requests
func (s *KubiksMCP) httpGetMetrics(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Parse query parameters
	limit := 10
	offset := 0

	if l := r.URL.Query().Get("limit"); l != "" {
		if parsedLimit, err := strconv.Atoi(l); err == nil {
			limit = parsedLimit
			if limit > 100 {
				limit = 100
			}
		}
	}

	if o := r.URL.Query().Get("offset"); o != "" {
		if parsedOffset, err := strconv.Atoi(o); err == nil {
			offset = parsedOffset
		}
	}

	metrics, err := s.db.GetMetricsPaginated(limit, offset)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Database error: %v"}`, err), http.StatusInternalServerError)
		return
	}

	// Return metrics as JSON array
	w.Write([]byte("["))
	for i, metric := range metrics {
		if i > 0 {
			w.Write([]byte(","))
		}
		w.Write([]byte(metric.Data))
	}
	w.Write([]byte("]"))
}

// Close closes the MCP server
func (s *KubiksMCP) Close() error {
	// The HTTP server shutdown is handled by the caller through http.Server.Close()
	// Here we can add any MCP-specific cleanup if needed in the future
	return nil
}
