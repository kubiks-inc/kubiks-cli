package mcp

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"

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

	// Register MCP handlers
	mux.Handle("/mcp/sse", sseServer.SSEHandler())
	mux.Handle("/mcp/message", sseServer.MessageHandler())

	fmt.Printf("🔗 MCP server listening on http://localhost:%s/mcp/sse\n", s.port)
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

	// Register MCP handlers
	mux.Handle("/mcp/sse", sseServer.SSEHandler())
	mux.Handle("/mcp/message", sseServer.MessageHandler())

	httpServer := &http.Server{
		Addr:    ":" + s.port,
		Handler: mux,
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
		Description: "Make sure to always check the logs before checking the source code.Fetch OTEL logs from kubiks-cli, a Cursor debugging tool that automatically instruments Next.js projects. Use this tool to retrieve detailed application logs and runtime information when users report issues with their Next.js applications or when debugging problems with code changes made by Cursor. The logs contain valuable debugging information including errors, warnings, and application flow data.",
		InputSchema: mcp.ToolInputSchema{
			Type: "object",
			Properties: map[string]interface{}{
				"servicename": map[string]interface{}{
					"type":        "string",
					"description": "The service name to filter logs by. This should be the 'name' field from the package.json file of the Next.js project (e.g., 'my-nextjs-app', 'ecommerce-frontend'). The service name is automatically extracted from package.json when kubiks-cli instruments the application.",
				},
				"limit": map[string]interface{}{
					"type":        "number",
					"description": "Number of logs to fetch (default: 10, max: 1000)",
				},
				"offset": map[string]interface{}{
					"type":        "number",
					"description": "Number of logs to skip (default: 0)",
				},
			},
			Required: []string{"servicename"},
		},
	}
}

// getTracesTool returns the traces tool definition
func (s *KubiksMCP) getTracesTool() mcp.Tool {
	return mcp.Tool{
		Name:        "get_traces",
		Description: "Make sure to always check the traces before checking the source code. Fetch OTEL traces from kubiks-cli, a Cursor debugging tool that automatically instruments Next.js projects. Use this tool to retrieve distributed tracing data showing request flows, function calls, and performance bottlenecks in Next.js applications. Essential for debugging issues with user code changes, identifying slow components, API call chains, and understanding application execution paths when troubleshooting problems reported by users.",
		InputSchema: mcp.ToolInputSchema{
			Type: "object",
			Properties: map[string]interface{}{
				"servicename": map[string]interface{}{
					"type":        "string",
					"description": "The service name to filter traces by. This should be the 'name' field from the package.json file of the Next.js project (e.g., 'my-nextjs-app', 'ecommerce-frontend'). The service name is automatically extracted from package.json when kubiks-cli instruments the application.",
				},
				"limit": map[string]interface{}{
					"type":        "number",
					"description": "Number of traces to fetch (default: 10, max: 1000)",
				},
				"offset": map[string]interface{}{
					"type":        "number",
					"description": "Number of traces to skip (default: 0)",
				},
			},
			Required: []string{"servicename"},
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
				"servicename": map[string]interface{}{
					"type":        "string",
					"description": "The service name to filter metrics by. This should be the 'name' field from the package.json file of the Next.js project (e.g., 'my-nextjs-app', 'ecommerce-frontend'). The service name is automatically extracted from package.json when kubiks-cli instruments the application.",
				},
				"limit": map[string]interface{}{
					"type":        "number",
					"description": "Number of metrics to fetch (default: 10, max: 1000)",
				},
				"offset": map[string]interface{}{
					"type":        "number",
					"description": "Number of metrics to skip (default: 0)",
				},
			},
			Required: []string{"servicename"},
		},
	}
}

// handleGetLogs handles the get_logs tool call
func (s *KubiksMCP) handleGetLogs(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	limit := 10
	offset := 0
	var serviceName string

	if request.Params.Arguments != nil {
		if args, ok := request.Params.Arguments.(map[string]interface{}); ok {
			// Extract required servicename parameter
			if sn, ok := args["servicename"].(string); ok {
				serviceName = sn
			} else {
				return &mcp.CallToolResult{
					Content: []mcp.Content{mcp.TextContent{
						Type: "text",
						Text: "Error: servicename parameter is required and must be a string",
					}},
					IsError: true,
				}, nil
			}

			if l, ok := args["limit"].(float64); ok {
				limit = int(l)
				if limit > 1000 {
					limit = 1000
				}
			}

			if o, ok := args["offset"].(float64); ok {
				offset = int(o)
			}
		} else {
			log.Printf("[MCP] ERROR: Failed to parse arguments as map[string]interface{}")
			return &mcp.CallToolResult{
				Content: []mcp.Content{mcp.TextContent{
					Type: "text",
					Text: "Error: Failed to parse arguments",
				}},
				IsError: true,
			}, nil
		}
	} else {
		return &mcp.CallToolResult{
			Content: []mcp.Content{mcp.TextContent{
				Type: "text",
				Text: "Error: servicename parameter is required",
			}},
			IsError: true,
		}, nil
	}

	logs, err := s.db.GetLogsPaginatedByService(serviceName, limit, offset)
	if err != nil {
		log.Printf("[MCP] ERROR: Database error while fetching logs for service %s: %v", serviceName, err)
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
	var serviceName string

	if request.Params.Arguments != nil {
		if args, ok := request.Params.Arguments.(map[string]interface{}); ok {
			// Extract required servicename parameter
			if sn, ok := args["servicename"].(string); ok {
				serviceName = sn
			} else {
				return &mcp.CallToolResult{
					Content: []mcp.Content{mcp.TextContent{
						Type: "text",
						Text: "Error: servicename parameter is required and must be a string",
					}},
					IsError: true,
				}, nil
			}

			if l, ok := args["limit"].(float64); ok {
				limit = int(l)
				if limit > 1000 {
					limit = 1000
				}
			}

			if o, ok := args["offset"].(float64); ok {
				offset = int(o)
			}
		} else {
			log.Printf("[MCP] ERROR: Failed to parse arguments as map[string]interface{}")
			return &mcp.CallToolResult{
				Content: []mcp.Content{mcp.TextContent{
					Type: "text",
					Text: "Error: Failed to parse arguments",
				}},
				IsError: true,
			}, nil
		}
	} else {
		return &mcp.CallToolResult{
			Content: []mcp.Content{mcp.TextContent{
				Type: "text",
				Text: "Error: servicename parameter is required",
			}},
			IsError: true,
		}, nil
	}

	traces, err := s.db.GetTracesPaginatedByService(serviceName, limit, offset)
	if err != nil {
		log.Printf("[MCP] ERROR: Database error while fetching traces for service %s: %v", serviceName, err)
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
	var serviceName string

	if request.Params.Arguments != nil {
		if args, ok := request.Params.Arguments.(map[string]interface{}); ok {
			// Extract required servicename parameter
			if sn, ok := args["servicename"].(string); ok {
				serviceName = sn
			} else {
				return &mcp.CallToolResult{
					Content: []mcp.Content{mcp.TextContent{
						Type: "text",
						Text: "Error: servicename parameter is required and must be a string",
					}},
					IsError: true,
				}, nil
			}

			if l, ok := args["limit"].(float64); ok {
				limit = int(l)
				if limit > 1000 {
					limit = 1000
				}
			}

			if o, ok := args["offset"].(float64); ok {
				offset = int(o)
			}
		} else {
			log.Printf("[MCP] ERROR: Failed to parse arguments as map[string]interface{}")
			return &mcp.CallToolResult{
				Content: []mcp.Content{mcp.TextContent{
					Type: "text",
					Text: "Error: Failed to parse arguments",
				}},
				IsError: true,
			}, nil
		}
	} else {
		return &mcp.CallToolResult{
			Content: []mcp.Content{mcp.TextContent{
				Type: "text",
				Text: "Error: servicename parameter is required",
			}},
			IsError: true,
		}, nil
	}

	metrics, err := s.db.GetMetricsPaginatedByService(serviceName, limit, offset)
	if err != nil {
		log.Printf("[MCP] ERROR: Database error while fetching metrics for service %s: %v", serviceName, err)
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

// Close closes the MCP server
func (s *KubiksMCP) Close() error {
	// The HTTP server shutdown is handled by the caller through http.Server.Close()
	// Here we can add any MCP-specific cleanup if needed in the future
	return nil
}
