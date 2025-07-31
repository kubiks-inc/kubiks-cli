package mcp

import (
	"os"
	"testing"

	"github.com/kubiks-inc/kubiks-cli/internal/database"
)

func setupTestDB(t *testing.T) *database.DB {
	tempDir := t.TempDir()
	originalHome := os.Getenv("HOME")
	t.Cleanup(func() { os.Setenv("HOME", originalHome) })
	os.Setenv("HOME", tempDir)

	db, err := database.NewDB(tempDir + "/test.db")
	if err != nil {
		t.Fatalf("Failed to create test database: %v", err)
	}
	return db
}

func TestNewMCPServer(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	mcpServer, err := NewMCPServer(db, "8081")
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if mcpServer == nil {
		t.Fatal("Expected non-nil MCP server")
	}

	if mcpServer.db != db {
		t.Error("Expected database to be set correctly")
	}

	if mcpServer.port != "8081" {
		t.Errorf("Expected port 8081, got %s", mcpServer.port)
	}

	if mcpServer.McpServer == nil {
		t.Error("Expected MCP server to be initialized")
	}
}

func TestKubiksMCP_GetLogsTool(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	mcpServer, err := NewMCPServer(db, "8081")
	if err != nil {
		t.Fatalf("Failed to create MCP server: %v", err)
	}

	tool := mcpServer.getLogsTool()

	if tool.Name != "get_logs" {
		t.Errorf("Expected tool name 'get_logs', got %s", tool.Name)
	}

	if tool.Description == "" {
		t.Error("Expected non-empty tool description")
	}

	if tool.InputSchema.Type != "object" {
		t.Errorf("Expected input schema type 'object', got %s", tool.InputSchema.Type)
	}

	// Check required servicename parameter
	if len(tool.InputSchema.Required) != 1 || tool.InputSchema.Required[0] != "servicename" {
		t.Errorf("Expected required parameter 'servicename', got %v", tool.InputSchema.Required)
	}

	// Check properties
	if tool.InputSchema.Properties == nil {
		t.Error("Expected input schema properties to be defined")
	}

	if _, exists := tool.InputSchema.Properties["servicename"]; !exists {
		t.Error("Expected 'servicename' property in input schema")
	}

	if _, exists := tool.InputSchema.Properties["limit"]; !exists {
		t.Error("Expected 'limit' property in input schema")
	}

	if _, exists := tool.InputSchema.Properties["offset"]; !exists {
		t.Error("Expected 'offset' property in input schema")
	}
}

func TestKubiksMCP_GetTracesTool(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	mcpServer, err := NewMCPServer(db, "8081")
	if err != nil {
		t.Fatalf("Failed to create MCP server: %v", err)
	}

	tool := mcpServer.getTracesTool()

	if tool.Name != "get_traces" {
		t.Errorf("Expected tool name 'get_traces', got %s", tool.Name)
	}

	if tool.Description == "" {
		t.Error("Expected non-empty tool description")
	}

	// Check required servicename parameter
	if len(tool.InputSchema.Required) != 1 || tool.InputSchema.Required[0] != "servicename" {
		t.Errorf("Expected required parameter 'servicename', got %v", tool.InputSchema.Required)
	}
}

func TestKubiksMCP_GetMetricsTool(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	mcpServer, err := NewMCPServer(db, "8081")
	if err != nil {
		t.Fatalf("Failed to create MCP server: %v", err)
	}

	tool := mcpServer.getMetricsTool()

	if tool.Name != "get_metrics" {
		t.Errorf("Expected tool name 'get_metrics', got %s", tool.Name)
	}

	if tool.Description == "" {
		t.Error("Expected non-empty tool description")
	}

	// Check required servicename parameter
	if len(tool.InputSchema.Required) != 1 || tool.InputSchema.Required[0] != "servicename" {
		t.Errorf("Expected required parameter 'servicename', got %v", tool.InputSchema.Required)
	}
}

func TestKubiksMCP_Close(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	mcpServer, err := NewMCPServer(db, "8081")
	if err != nil {
		t.Fatalf("Failed to create MCP server: %v", err)
	}

	err = mcpServer.Close()
	if err != nil {
		t.Errorf("Expected no error on close, got %v", err)
	}
}
