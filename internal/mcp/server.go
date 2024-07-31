package mcp

import (
	"context"
	"fmt"
	"net/http"

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

// Start starts the MCP server with HTTP/SSE transport
func (s *KubiksMCP) Start() error {
	fmt.Printf("🔗 MCP server starting on port %s...\n", s.port)

	sseServer := server.NewSSEServer(
		s.McpServer,
		server.WithBasePath("/mcp"),
		server.WithSSEEndpoint("/sse"),
		server.WithMessageEndpoint("/message"),
	)

	http.Handle("/mcp/sse", sseServer.SSEHandler())
	http.Handle("/mcp/message", sseServer.MessageHandler())

	fmt.Printf("🔗 MCP server listening on http://localhost:%s/mcp/sse\n", s.port)
	return nil
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
		Description: "Fetch OTEL logs with pagination",
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
		Description: "Fetch OTEL traces with pagination",
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
		Description: "Fetch OTEL metrics with pagination",
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
		}
	}
	
	logs, err := s.db.GetLogsPaginated(limit, offset)
	if err != nil {
		return &mcp.CallToolResult{
			Content: []mcp.Content{mcp.TextContent{
				Type: "text",
				Text: fmt.Sprintf("Database error: %v", err),
			}},
			IsError: true,
		}, nil
	}
	
	return &mcp.CallToolResult{
		Content: []mcp.Content{mcp.TextContent{
			Type: "text",
			Text: fmt.Sprintf("Retrieved %d logs (offset: %d, limit: %d)", len(logs), offset, limit),
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
		}
	}
	
	traces, err := s.db.GetTracesPaginated(limit, offset)
	if err != nil {
		return &mcp.CallToolResult{
			Content: []mcp.Content{mcp.TextContent{
				Type: "text",
				Text: fmt.Sprintf("Database error: %v", err),
			}},
			IsError: true,
		}, nil
	}
	
	return &mcp.CallToolResult{
		Content: []mcp.Content{mcp.TextContent{
			Type: "text",
			Text: fmt.Sprintf("Retrieved %d traces (offset: %d, limit: %d)", len(traces), offset, limit),
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
		}
	}
	
	metrics, err := s.db.GetMetricsPaginated(limit, offset)
	if err != nil {
		return &mcp.CallToolResult{
			Content: []mcp.Content{mcp.TextContent{
				Type: "text",
				Text: fmt.Sprintf("Database error: %v", err),
			}},
			IsError: true,
		}, nil
	}
	
	return &mcp.CallToolResult{
		Content: []mcp.Content{mcp.TextContent{
			Type: "text",
			Text: fmt.Sprintf("Retrieved %d metrics (offset: %d, limit: %d)", len(metrics), offset, limit),
		}},
		IsError: false,
	}, nil
}

// Close closes the MCP server
func (s *KubiksMCP) Close() error {
	// Graceful shutdown if needed
	return nil
}