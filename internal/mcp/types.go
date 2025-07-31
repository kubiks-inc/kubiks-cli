package mcp

import "encoding/json"

// MCPRequest represents an MCP JSON-RPC request
type MCPRequest struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      string          `json:"id"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params,omitempty"`
}

// MCPResponse represents an MCP JSON-RPC response
type MCPResponse struct {
	JSONRPC string      `json:"jsonrpc"`
	ID      string      `json:"id,omitempty"`
	Result  interface{} `json:"result,omitempty"`
	Error   *MCPError   `json:"error,omitempty"`
}

// MCPError represents an MCP JSON-RPC error
type MCPError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// MCPTool represents an available MCP tool
type MCPTool struct {
	Name        string        `json:"name"`
	Description string        `json:"description"`
	InputSchema MCPToolSchema `json:"inputSchema"`
}

// MCPToolSchema represents the input schema for a tool
type MCPToolSchema struct {
	Type       string                 `json:"type"`
	Properties map[string]MCPProperty `json:"properties,omitempty"`
	Required   []string               `json:"required,omitempty"`
}

// MCPProperty represents a property in a tool schema
type MCPProperty struct {
	Type        string `json:"type"`
	Description string `json:"description,omitempty"`
}

// MCPToolsListResult represents the result of tools/list
type MCPToolsListResult struct {
	Tools []MCPTool `json:"tools"`
}

// MCPToolsCallParams represents the parameters for tools/call
type MCPToolsCallParams struct {
	Name      string                 `json:"name"`
	Arguments map[string]interface{} `json:"arguments,omitempty"`
}

// MCPToolCallResult represents the result of a tool call
type MCPToolCallResult struct {
	Content []MCPContent `json:"content"`
	IsError bool         `json:"isError"`
}

// MCPContent represents content in a tool call result
type MCPContent struct {
	Type string `json:"type"`
	Text string `json:"text"`
}
