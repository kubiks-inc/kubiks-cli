package mcp

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"os"

	"github.com/kubiks-inc/kubiks-cli/internal/database"
)

// MCPServer represents the MCP server
type MCPServer struct {
	db       *database.DB
	listener net.Listener
}

// NewMCPServer creates a new MCP server instance
func NewMCPServer(db *database.DB) (*MCPServer, error) {
	// Use stdin/stdout for MCP communication
	return &MCPServer{
		db: db,
	}, nil
}

// Start starts the MCP server
func (s *MCPServer) Start() error {
	fmt.Println("🔗 MCP server running on stdio...")
	
	// Handle MCP requests from stdin
	decoder := json.NewDecoder(os.Stdin)
	encoder := json.NewEncoder(os.Stdout)
	
	for {
		var request MCPRequest
		if err := decoder.Decode(&request); err != nil {
			if err.Error() == "EOF" {
				break
			}
			log.Printf("Error decoding request: %v", err)
			continue
		}
		
		response := s.handleRequest(request)
		if err := encoder.Encode(response); err != nil {
			log.Printf("Error encoding response: %v", err)
		}
	}
	
	return nil
}

// handleRequest processes MCP requests
func (s *MCPServer) handleRequest(request MCPRequest) MCPResponse {
	switch request.Method {
	case "tools/list":
		return s.handleToolsList()
	case "tools/call":
		return s.handleToolsCall(request)
	default:
		return MCPResponse{
			ID:      request.ID,
			Error:   &MCPError{Code: -32601, Message: "Method not found"},
		}
	}
}

// handleToolsList returns available tools
func (s *MCPServer) handleToolsList() MCPResponse {
	tools := []MCPTool{
		{
			Name:        "get_logs",
			Description: "Fetch OTEL logs with pagination",
			InputSchema: MCPToolSchema{
				Type: "object",
				Properties: map[string]MCPProperty{
					"limit": {
						Type:        "number",
						Description: "Number of logs to fetch (default: 10, max: 100)",
					},
					"offset": {
						Type:        "number", 
						Description: "Number of logs to skip (default: 0)",
					},
				},
			},
		},
		{
			Name:        "get_traces",
			Description: "Fetch OTEL traces with pagination",
			InputSchema: MCPToolSchema{
				Type: "object",
				Properties: map[string]MCPProperty{
					"limit": {
						Type:        "number",
						Description: "Number of traces to fetch (default: 10, max: 100)",
					},
					"offset": {
						Type:        "number",
						Description: "Number of traces to skip (default: 0)",
					},
				},
			},
		},
		{
			Name:        "get_metrics",
			Description: "Fetch OTEL metrics with pagination", 
			InputSchema: MCPToolSchema{
				Type: "object",
				Properties: map[string]MCPProperty{
					"limit": {
						Type:        "number",
						Description: "Number of metrics to fetch (default: 10, max: 100)",
					},
					"offset": {
						Type:        "number",
						Description: "Number of metrics to skip (default: 0)",
					},
				},
			},
		},
	}
	
	return MCPResponse{
		Result: MCPToolsListResult{Tools: tools},
	}
}

// handleToolsCall executes tool calls
func (s *MCPServer) handleToolsCall(request MCPRequest) MCPResponse {
	var params MCPToolsCallParams
	if err := json.Unmarshal(request.Params, &params); err != nil {
		return MCPResponse{
			ID:    request.ID,
			Error: &MCPError{Code: -32602, Message: "Invalid params"},
		}
	}
	
	switch params.Name {
	case "get_logs":
		return s.handleGetLogs(request.ID, params.Arguments)
	case "get_traces":
		return s.handleGetTraces(request.ID, params.Arguments)
	case "get_metrics":
		return s.handleGetMetrics(request.ID, params.Arguments)
	default:
		return MCPResponse{
			ID:    request.ID,
			Error: &MCPError{Code: -32601, Message: "Tool not found"},
		}
	}
}

// handleGetLogs fetches logs with pagination
func (s *MCPServer) handleGetLogs(id string, args map[string]interface{}) MCPResponse {
	limit := 10
	offset := 0
	
	if l, ok := args["limit"].(float64); ok {
		limit = int(l)
		if limit > 100 {
			limit = 100
		}
	}
	
	if o, ok := args["offset"].(float64); ok {
		offset = int(o)
	}
	
	logs, err := s.db.GetLogsPaginated(limit, offset)
	if err != nil {
		return MCPResponse{
			ID:    id,
			Error: &MCPError{Code: -32603, Message: fmt.Sprintf("Database error: %v", err)},
		}
	}
	
	return MCPResponse{
		ID: id,
		Result: MCPToolCallResult{
			Content: []MCPContent{{
				Type: "text",
				Text: fmt.Sprintf("Retrieved %d logs (offset: %d, limit: %d)", len(logs), offset, limit),
			}},
			IsError: false,
		},
	}
}

// handleGetTraces fetches traces with pagination
func (s *MCPServer) handleGetTraces(id string, args map[string]interface{}) MCPResponse {
	limit := 10
	offset := 0
	
	if l, ok := args["limit"].(float64); ok {
		limit = int(l)
		if limit > 100 {
			limit = 100
		}
	}
	
	if o, ok := args["offset"].(float64); ok {
		offset = int(o)
	}
	
	traces, err := s.db.GetTracesPaginated(limit, offset)
	if err != nil {
		return MCPResponse{
			ID:    id,
			Error: &MCPError{Code: -32603, Message: fmt.Sprintf("Database error: %v", err)},
		}
	}
	
	return MCPResponse{
		ID: id,
		Result: MCPToolCallResult{
			Content: []MCPContent{{
				Type: "text",
				Text: fmt.Sprintf("Retrieved %d traces (offset: %d, limit: %d)", len(traces), offset, limit),
			}},
			IsError: false,
		},
	}
}

// handleGetMetrics fetches metrics with pagination
func (s *MCPServer) handleGetMetrics(id string, args map[string]interface{}) MCPResponse {
	limit := 10
	offset := 0
	
	if l, ok := args["limit"].(float64); ok {
		limit = int(l)
		if limit > 100 {
			limit = 100
		}
	}
	
	if o, ok := args["offset"].(float64); ok {
		offset = int(o)
	}
	
	metrics, err := s.db.GetMetricsPaginated(limit, offset)
	if err != nil {
		return MCPResponse{
			ID:    id,
			Error: &MCPError{Code: -32603, Message: fmt.Sprintf("Database error: %v", err)},
		}
	}
	
	return MCPResponse{
		ID: id,
		Result: MCPToolCallResult{
			Content: []MCPContent{{
				Type: "text",
				Text: fmt.Sprintf("Retrieved %d metrics (offset: %d, limit: %d)", len(metrics), offset, limit),
			}},
			IsError: false,
		},
	}
}

// Close closes the MCP server
func (s *MCPServer) Close() error {
	if s.listener != nil {
		return s.listener.Close()
	}
	return nil
}