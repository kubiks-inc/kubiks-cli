package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/kubiks-inc/kubiks-cli/internal/commands"
	"github.com/kubiks-inc/kubiks-cli/internal/database"
	"github.com/kubiks-inc/kubiks-cli/internal/detector"
	"github.com/kubiks-inc/kubiks-cli/internal/mcpconfig"
	"github.com/kubiks-inc/kubiks-cli/pkg/types"
)

// Integration test for database operations with OTEL data
func TestDatabaseIntegration(t *testing.T) {
	// Create temporary database
	tempDir, err := os.MkdirTemp("", "kubiks-integration-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	dbPath := filepath.Join(tempDir, "test.db")
	db, err := database.NewDB(dbPath)
	if err != nil {
		t.Fatalf("Failed to create database: %v", err)
	}
	defer db.Close()

	// Test inserting and retrieving OTEL data
	testLogData := `{
		"resourceLogs": [
			{
				"resource": {
					"attributes": [
						{
							"key": "service.name",
							"value": {
								"stringValue": "integration-test-service"
							}
						}
					]
				},
				"scopeLogs": [
					{
						"logRecords": [
							{
								"timeUnixNano": "1609459200000000000",
								"body": {
									"stringValue": "Integration test log message"
								},
								"traceId": "integration-trace-123"
							}
						]
					}
				]
			}
		]
	}`

	// Insert log
	logID, err := db.InsertLog("integration-trace-123", testLogData)
	if err != nil {
		t.Fatalf("Failed to insert log: %v", err)
	}

	if logID <= 0 {
		t.Errorf("Invalid log ID returned: %d", logID)
	}

	// Retrieve logs by service
	logs, err := db.GetLogsPaginatedByService("integration-test-service", 10, 0)
	if err != nil {
		t.Fatalf("Failed to retrieve logs: %v", err)
	}

	if len(logs) != 1 {
		t.Errorf("Expected 1 log, got %d", len(logs))
	}

	if logs[0].ServiceName != "integration-test-service" {
		t.Errorf("Expected service name 'integration-test-service', got '%s'", logs[0].ServiceName)
	}

	if logs[0].TraceID != "integration-trace-123" {
		t.Errorf("Expected trace ID 'integration-trace-123', got '%s'", logs[0].TraceID)
	}

	// Test stats
	stats, err := db.GetStats()
	if err != nil {
		t.Fatalf("Failed to get stats: %v", err)
	}

	if stats["logs_count"] != 1 {
		t.Errorf("Expected 1 log in stats, got %d", stats["logs_count"])
	}

	if stats["metrics_count"] != 0 {
		t.Errorf("Expected 0 metrics in stats, got %d", stats["metrics_count"])
	}

	if stats["traces_count"] != 0 {
		t.Errorf("Expected 0 traces in stats, got %d", stats["traces_count"])
	}
}

// Integration test for MCP configuration management
func TestMCPConfigIntegration(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "kubiks-mcp-integration-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	// Test adding kubiks server
	manager := mcpconfig.NewManager()
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)

	// Set temp home directory
	os.Setenv("HOME", tempDir)
	manager = mcpconfig.NewManager()

	// Add kubiks server
	err = manager.AddKubiksServer()
	if err != nil {
		t.Fatalf("Failed to add kubiks server: %v", err)
	}

	// Verify config file was created
	expectedConfigPath := filepath.Join(tempDir, ".cursor", "mcp.json")
	if _, err := os.Stat(expectedConfigPath); os.IsNotExist(err) {
		t.Error("MCP config file was not created")
	}

	// Read and verify config content
	configData, err := os.ReadFile(expectedConfigPath)
	if err != nil {
		t.Fatalf("Failed to read config file: %v", err)
	}

	var config types.MCPConfig
	err = json.Unmarshal(configData, &config)
	if err != nil {
		t.Fatalf("Failed to unmarshal config: %v", err)
	}

	// Verify kubiks server is present
	kubiksServer, exists := config.MCPServers["kubiks"]
	if !exists {
		t.Error("Kubiks server not found in config")
	}

	if kubiksServer.URL != "http://localhost:7433/mcp/sse" {
		t.Errorf("Expected kubiks server URL 'http://localhost:7433/mcp/sse', got '%s'", kubiksServer.URL)
	}

	// Test removing kubiks server
	err = manager.RemoveKubiksServer()
	if err != nil {
		t.Fatalf("Failed to remove kubiks server: %v", err)
	}

	// Verify server was removed
	configData, err = os.ReadFile(expectedConfigPath)
	if err != nil {
		t.Fatalf("Failed to read config file after removal: %v", err)
	}

	var updatedConfig types.MCPConfig
	err = json.Unmarshal(configData, &updatedConfig)
	if err != nil {
		t.Fatalf("Failed to unmarshal updated config: %v", err)
	}

	if _, exists := updatedConfig.MCPServers["kubiks"]; exists {
		t.Error("Kubiks server should have been removed from config")
	}
}

// Integration test for Next.js project detection and command creation
func TestNextJSDetectionIntegration(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "kubiks-nextjs-integration-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	// Save original directory
	originalDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("Failed to get current directory: %v", err)
	}
	defer os.Chdir(originalDir)

	// Change to temp directory
	if err := os.Chdir(tempDir); err != nil {
		t.Fatalf("Failed to change to temp directory: %v", err)
	}

	// Test case 1: Non-Next.js project
	packageJSON := map[string]interface{}{
		"name": "regular-react-app",
		"dependencies": map[string]interface{}{
			"react": "18.0.0",
			"express": "4.18.0",
		},
	}

	jsonData, _ := json.Marshal(packageJSON)
	if err := os.WriteFile("package.json", jsonData, 0644); err != nil {
		t.Fatalf("Failed to create package.json: %v", err)
	}

	// Test detection
	detector := detector.NewNextJSDetector()
	isSupported, err := detector.IsSupported()
	if isSupported {
		t.Error("Should not detect non-Next.js project as supported")
	}

	if err == nil {
		t.Error("Should return error for non-Next.js project")
	}

	// Test DevCommand with non-Next.js project
	devCmd := commands.NewDevCommand()
	err = devCmd.RunDirect()
	if err == nil {
		t.Error("DevCommand should fail for non-Next.js project")
	}

	// Test case 2: Next.js project
	nextjsPackageJSON := map[string]interface{}{
		"name": "nextjs-app",
		"dependencies": map[string]interface{}{
			"next": "13.0.0",
			"react": "18.0.0",
		},
		"scripts": map[string]interface{}{
			"dev": "next dev",
		},
	}

	jsonData, _ = json.Marshal(nextjsPackageJSON)
	if err := os.WriteFile("package.json", jsonData, 0644); err != nil {
		t.Fatalf("Failed to create Next.js package.json: %v", err)
	}

	// Test detection
	isSupported, err = detector.IsSupported()
	if !isSupported {
		t.Error("Should detect Next.js project as supported")
	}

	if err != nil {
		t.Errorf("Should not return error for Next.js project: %v", err)
	}

	if detector.GetProjectType() != "Next.js" {
		t.Errorf("Expected project type 'Next.js', got '%s'", detector.GetProjectType())
	}
}

// Integration test for types and utility functions
func TestTypesIntegration(t *testing.T) {
	// Test GetAppDataDir and GetDatabasePath integration
	appDataDir := types.GetAppDataDir()
	dbPath := types.GetDatabasePath()

	// Verify database path is within app data directory
	if !filepath.HasPrefix(dbPath, appDataDir) {
		t.Errorf("Database path '%s' should be within app data directory '%s'", dbPath, appDataDir)
	}

	// Verify database filename
	expectedFilename := "kubiks_data.db"
	if filepath.Base(dbPath) != expectedFilename {
		t.Errorf("Expected database filename '%s', got '%s'", expectedFilename, filepath.Base(dbPath))
	}

	// Test MCPConfig and MCPServerConfig structures
	config := types.MCPConfig{
		MCPServers: map[string]types.MCPServerConfig{
			"test-server": {
				URL: "http://localhost:8080/test",
			},
		},
	}

	// Test JSON marshaling/unmarshaling
	jsonData, err := json.Marshal(config)
	if err != nil {
		t.Fatalf("Failed to marshal MCPConfig: %v", err)
	}

	var unmarshaledConfig types.MCPConfig
	err = json.Unmarshal(jsonData, &unmarshaledConfig)
	if err != nil {
		t.Fatalf("Failed to unmarshal MCPConfig: %v", err)
	}

	// Verify data integrity
	if len(unmarshaledConfig.MCPServers) != 1 {
		t.Errorf("Expected 1 server after unmarshal, got %d", len(unmarshaledConfig.MCPServers))
	}

	testServer, exists := unmarshaledConfig.MCPServers["test-server"]
	if !exists {
		t.Error("test-server not found after unmarshal")
	}

	if testServer.URL != "http://localhost:8080/test" {
		t.Errorf("Expected URL 'http://localhost:8080/test', got '%s'", testServer.URL)
	}
}

// Test concurrent database operations (integration stress test)
func TestConcurrentDatabaseOperations(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "kubiks-concurrent-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	dbPath := filepath.Join(tempDir, "concurrent.db")
	db, err := database.NewDB(dbPath)
	if err != nil {
		t.Fatalf("Failed to create database: %v", err)
	}
	defer db.Close()

	// Run concurrent operations
	const numGoroutines = 10
	const operationsPerGoroutine = 5

	errChan := make(chan error, numGoroutines)
	doneChan := make(chan struct{}, numGoroutines)

	for i := 0; i < numGoroutines; i++ {
		go func(routineID int) {
			defer func() { doneChan <- struct{}{} }()

			for j := 0; j < operationsPerGoroutine; j++ {
				testData := `{"resourceLogs":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"concurrent-service"}}]},"scopeLogs":[{"logRecords":[{"body":{"stringValue":"Concurrent test"}}]}]}]}`
				traceID := "concurrent-trace"

				_, err := db.InsertLog(traceID, testData)
				if err != nil {
					errChan <- err
					return
				}

				// Small delay to increase chance of concurrent access
				time.Sleep(1 * time.Millisecond)
			}
		}(i)
	}

	// Wait for all goroutines to complete
	for i := 0; i < numGoroutines; i++ {
		select {
		case err := <-errChan:
			t.Fatalf("Concurrent operation failed: %v", err)
		case <-doneChan:
			// Goroutine completed successfully
		case <-time.After(10 * time.Second):
			t.Fatal("Concurrent operations timed out")
		}
	}

	// Verify total count
	stats, err := db.GetStats()
	if err != nil {
		t.Fatalf("Failed to get stats after concurrent operations: %v", err)
	}

	expectedCount := int64(numGoroutines * operationsPerGoroutine)
	if stats["logs_count"] != expectedCount {
		t.Errorf("Expected %d logs after concurrent operations, got %d", expectedCount, stats["logs_count"])
	}
}

// Test end-to-end workflow simulation
func TestEndToEndWorkflow(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "kubiks-e2e-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	// Set up temporary home directory
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)
	os.Setenv("HOME", tempDir)

	// 1. Initialize MCP configuration
	mcpManager := mcpconfig.NewManager()
	err = mcpManager.AddKubiksServer()
	if err != nil {
		t.Fatalf("Failed to add MCP server: %v", err)
	}

	// 2. Create database for OTEL data
	dbPath := types.GetDatabasePath()
	db, err := database.NewDB(dbPath)
	if err != nil {
		t.Fatalf("Failed to create database: %v", err)
	}
	defer db.Close()

	// 3. Simulate OTEL data ingestion
	otelData := []struct {
		traceID     string
		serviceName string
		data        string
	}{
		{
			traceID:     "workflow-trace-1",
			serviceName: "frontend-service",
			data:        `{"resourceLogs":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"frontend-service"}}]},"scopeLogs":[{"logRecords":[{"body":{"stringValue":"User login"}}]}]}]}`,
		},
		{
			traceID:     "workflow-trace-2",
			serviceName: "backend-service",
			data:        `{"resourceLogs":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"backend-service"}}]},"scopeLogs":[{"logRecords":[{"body":{"stringValue":"Database query"}}]}]}]}`,
		},
	}

	for _, item := range otelData {
		_, err := db.InsertLog(item.traceID, item.data)
		if err != nil {
			t.Fatalf("Failed to insert OTEL data: %v", err)
		}
	}

	// 4. Query data by service
	frontendLogs, err := db.GetLogsPaginatedByService("frontend-service", 10, 0)
	if err != nil {
		t.Fatalf("Failed to query frontend logs: %v", err)
	}

	if len(frontendLogs) != 1 {
		t.Errorf("Expected 1 frontend log, got %d", len(frontendLogs))
	}

	backendLogs, err := db.GetLogsPaginatedByService("backend-service", 10, 0)
	if err != nil {
		t.Fatalf("Failed to query backend logs: %v", err)
	}

	if len(backendLogs) != 1 {
		t.Errorf("Expected 1 backend log, got %d", len(backendLogs))
	}

	// 5. Verify overall stats
	stats, err := db.GetStats()
	if err != nil {
		t.Fatalf("Failed to get final stats: %v", err)
	}

	if stats["logs_count"] != 2 {
		t.Errorf("Expected 2 total logs, got %d", stats["logs_count"])
	}

	// 6. Clean up MCP configuration
	err = mcpManager.RemoveKubiksServer()
	if err != nil {
		t.Fatalf("Failed to remove MCP server: %v", err)
	}

	// Verify MCP config was cleaned up
	// The config file should still exist but without the kubiks server
	configPath := filepath.Join(tempDir, ".cursor", "mcp.json")
	if _, err := os.Stat(configPath); err != nil {
		t.Errorf("MCP config file should exist after cleanup: %v", err)
	}
}