package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
)

func TestNewServer(t *testing.T) {
	// Create a temporary directory for test database
	tempDir := t.TempDir()
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)
	os.Setenv("HOME", tempDir)

	server, err := NewServer("8080")
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	defer server.Close()

	if server.port != "8080" {
		t.Errorf("Expected port 8080, got %s", server.port)
	}

	if server.db == nil {
		t.Error("Expected database to be initialized")
	}
}

func TestNewServer_DatabaseError(t *testing.T) {
	// Use invalid path to force database error
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)
	os.Setenv("HOME", "/invalid/path/that/does/not/exist")

	_, err := NewServer("8080")
	if err == nil {
		t.Fatal("Expected error when database initialization fails")
	}

	if !strings.Contains(err.Error(), "failed to initialize database") {
		t.Errorf("Expected database initialization error, got %v", err)
	}
}

func TestServer_GetDB(t *testing.T) {
	tempDir := t.TempDir()
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)
	os.Setenv("HOME", tempDir)

	server, err := NewServer("8080")
	if err != nil {
		t.Fatalf("Failed to create server: %v", err)
	}
	defer server.Close()

	db := server.GetDB()
	if db == nil {
		t.Error("Expected non-nil database")
	}

	// Verify it's the same instance
	if db != server.db {
		t.Error("GetDB should return the same database instance")
	}
}

func TestServer_Close(t *testing.T) {
	tempDir := t.TempDir()
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)
	os.Setenv("HOME", tempDir)

	server, err := NewServer("8080")
	if err != nil {
		t.Fatalf("Failed to create server: %v", err)
	}

	err = server.Close()
	if err != nil {
		t.Errorf("Expected no error on close, got %v", err)
	}
}

func TestServer_CloseNilDB(t *testing.T) {
	server := &Server{db: nil, port: "8080"}
	err := server.Close()
	if err != nil {
		t.Errorf("Expected no error when closing server with nil database, got %v", err)
	}
}

func TestServer_HelloHandler(t *testing.T) {
	server := &Server{port: "8080"}

	req := httptest.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()

	server.HelloHandler(w, req)

	resp := w.Result()
	body := w.Body.String()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	expectedParts := []string{
		"Hello World from Kubiks Server!",
		"Method: GET",
		"URL: /",
		"Server running on port 8080",
	}

	for _, part := range expectedParts {
		if !strings.Contains(body, part) {
			t.Errorf("Expected response to contain '%s', got: %s", part, body)
		}
	}
}

func TestServer_HealthHandler_Success(t *testing.T) {
	tempDir := t.TempDir()
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)
	os.Setenv("HOME", tempDir)

	server, err := NewServer("8080")
	if err != nil {
		t.Fatalf("Failed to create server: %v", err)
	}
	defer server.Close()

	req := httptest.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()

	server.HealthHandler(w, req)

	resp := w.Result()
	body := w.Body.String()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	if body != "OK" {
		t.Errorf("Expected 'OK', got %s", body)
	}
}

func TestServer_HealthHandler_DatabaseUnavailable(t *testing.T) {
	// Create server with working database, then close it to simulate failure
	tempDir := t.TempDir()
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)
	os.Setenv("HOME", tempDir)

	server, err := NewServer("8080")
	if err != nil {
		t.Fatalf("Failed to create server: %v", err)
	}
	// Close database to simulate failure
	server.Close()

	req := httptest.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()

	server.HealthHandler(w, req)

	resp := w.Result()
	body := w.Body.String()

	if resp.StatusCode != http.StatusServiceUnavailable {
		t.Errorf("Expected status 503, got %d", resp.StatusCode)
	}

	if !strings.Contains(body, "Database unavailable") {
		t.Errorf("Expected database unavailable message, got %s", body)
	}
}

func TestServer_OTELLogsHandler_Success(t *testing.T) {
	tempDir := t.TempDir()
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)
	os.Setenv("HOME", tempDir)

	server, err := NewServer("8080")
	if err != nil {
		t.Fatalf("Failed to create server: %v", err)
	}
	defer server.Close()

	logData := `{"timestamp":"2023-01-01T00:00:00Z","message":"test log","traceId":"123456"}`
	req := httptest.NewRequest("POST", "/otel/logs", bytes.NewBufferString(logData))
	w := httptest.NewRecorder()

	server.OTELLogsHandler(w, req)

	resp := w.Result()
	body := w.Body.String()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	if resp.Header.Get("Content-Type") != "application/json" {
		t.Errorf("Expected Content-Type application/json, got %s", resp.Header.Get("Content-Type"))
	}

	expectedResponse := `{"partialSuccess":{},"inserted":0}`
	if body != expectedResponse {
		t.Errorf("Expected %s, got %s", expectedResponse, body)
	}
}

func TestServer_OTELLogsHandler_MethodNotAllowed(t *testing.T) {
	server := &Server{port: "8080"}

	req := httptest.NewRequest("GET", "/otel/logs", nil)
	w := httptest.NewRecorder()

	server.OTELLogsHandler(w, req)

	resp := w.Result()

	if resp.StatusCode != http.StatusMethodNotAllowed {
		t.Errorf("Expected status 405, got %d", resp.StatusCode)
	}
}

func TestServer_OTELLogsHandler_BadRequest(t *testing.T) {
	server := &Server{port: "8080"}

	// Create a request with a body that will cause ReadAll to fail
	req := httptest.NewRequest("POST", "/otel/logs", &badReader{})
	w := httptest.NewRecorder()

	server.OTELLogsHandler(w, req)

	resp := w.Result()

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", resp.StatusCode)
	}
}

func TestServer_OTELMetricsHandler_Success(t *testing.T) {
	tempDir := t.TempDir()
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)
	os.Setenv("HOME", tempDir)

	server, err := NewServer("8080")
	if err != nil {
		t.Fatalf("Failed to create server: %v", err)
	}
	defer server.Close()

	metricData := `{"timestamp":"2023-01-01T00:00:00Z","metric":"cpu_usage","value":50.5,"traceId":"123456"}`
	req := httptest.NewRequest("POST", "/otel/metrics", bytes.NewBufferString(metricData))
	w := httptest.NewRecorder()

	server.OTELMetricsHandler(w, req)

	resp := w.Result()
	body := w.Body.String()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	if resp.Header.Get("Content-Type") != "application/json" {
		t.Errorf("Expected Content-Type application/json, got %s", resp.Header.Get("Content-Type"))
	}

	expectedResponse := `{"partialSuccess":{}}`
	if body != expectedResponse {
		t.Errorf("Expected %s, got %s", expectedResponse, body)
	}
}

func TestServer_OTELMetricsHandler_MethodNotAllowed(t *testing.T) {
	server := &Server{port: "8080"}

	req := httptest.NewRequest("GET", "/otel/metrics", nil)
	w := httptest.NewRecorder()

	server.OTELMetricsHandler(w, req)

	resp := w.Result()

	if resp.StatusCode != http.StatusMethodNotAllowed {
		t.Errorf("Expected status 405, got %d", resp.StatusCode)
	}
}

func TestServer_OTELTracesHandler_Success(t *testing.T) {
	tempDir := t.TempDir()
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)
	os.Setenv("HOME", tempDir)

	server, err := NewServer("8080")
	if err != nil {
		t.Fatalf("Failed to create server: %v", err)
	}
	defer server.Close()

	traceData := `{"timestamp":"2023-01-01T00:00:00Z","spans":[{"traceId":"123456","spanId":"789"}]}`
	req := httptest.NewRequest("POST", "/otel/traces", bytes.NewBufferString(traceData))
	w := httptest.NewRecorder()

	server.OTELTracesHandler(w, req)

	resp := w.Result()
	body := w.Body.String()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	if resp.Header.Get("Content-Type") != "application/json" {
		t.Errorf("Expected Content-Type application/json, got %s", resp.Header.Get("Content-Type"))
	}

	expectedResponse := `{"partialSuccess":{},"inserted":0}`
	if body != expectedResponse {
		t.Errorf("Expected %s, got %s", expectedResponse, body)
	}
}

func TestServer_OTELTracesHandler_MethodNotAllowed(t *testing.T) {
	server := &Server{port: "8080"}

	req := httptest.NewRequest("GET", "/otel/traces", nil)
	w := httptest.NewRecorder()

	server.OTELTracesHandler(w, req)

	resp := w.Result()

	if resp.StatusCode != http.StatusMethodNotAllowed {
		t.Errorf("Expected status 405, got %d", resp.StatusCode)
	}
}

func TestServer_StatsHandler_Success(t *testing.T) {
	tempDir := t.TempDir()
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)
	os.Setenv("HOME", tempDir)

	server, err := NewServer("8080")
	if err != nil {
		t.Fatalf("Failed to create server: %v", err)
	}
	defer server.Close()

	req := httptest.NewRequest("GET", "/stats", nil)
	w := httptest.NewRecorder()

	server.StatsHandler(w, req)

	resp := w.Result()
	body := w.Body.String()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	if resp.Header.Get("Content-Type") != "application/json" {
		t.Errorf("Expected Content-Type application/json, got %s", resp.Header.Get("Content-Type"))
	}

	// Parse JSON to verify structure
	var stats map[string]interface{}
	if err := json.Unmarshal([]byte(body), &stats); err != nil {
		t.Errorf("Invalid JSON response: %v", err)
	}

	expectedFields := []string{"logs_count", "metrics_count", "traces_count", "database_path"}
	for _, field := range expectedFields {
		if _, exists := stats[field]; !exists {
			t.Errorf("Expected field %s in response, got: %s", field, body)
		}
	}
}

func TestServer_StatsHandler_DatabaseError(t *testing.T) {
	// Create server with working database, then close it to simulate failure
	tempDir := t.TempDir()
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)
	os.Setenv("HOME", tempDir)

	server, err := NewServer("8080")
	if err != nil {
		t.Fatalf("Failed to create server: %v", err)
	}
	// Close database to simulate failure
	server.Close()

	req := httptest.NewRequest("GET", "/stats", nil)
	w := httptest.NewRecorder()

	server.StatsHandler(w, req)

	resp := w.Result()
	body := w.Body.String()

	if resp.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status 500, got %d", resp.StatusCode)
	}

	if !strings.Contains(body, "Failed to get stats") {
		t.Errorf("Expected error message about stats failure, got %s", body)
	}
}

// badReader simulates an io.Reader that always returns an error
type badReader struct{}

func (br *badReader) Read(p []byte) (int, error) {
	return 0, fmt.Errorf("simulated read error")
}

// Integration test to verify handlers work with actual database
func TestServer_Integration(t *testing.T) {
	tempDir := t.TempDir()
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)
	os.Setenv("HOME", tempDir)

	server, err := NewServer("8080")
	if err != nil {
		t.Fatalf("Failed to create server: %v", err)
	}
	defer server.Close()

	// Test inserting and retrieving data
	logData := `{
		"resourceLogs": [{
			"resource": {
				"attributes": [
					{"key": "service.name", "value": {"stringValue": "test-service"}}
				]
			},
			"scopeLogs": [{
				"scope": {},
				"logRecords": [{
					"timeUnixNano": "1640995200000000000",
					"severityText": "INFO",
					"body": {"stringValue": "integration test"},
					"attributes": [
						{"key": "traceId", "value": {"stringValue": "integration-123"}}
					]
				}]
			}]
		}]
	}`

	// Insert log
	req := httptest.NewRequest("POST", "/otel/logs", bytes.NewBufferString(logData))
	w := httptest.NewRecorder()
	server.OTELLogsHandler(w, req)

	if w.Result().StatusCode != http.StatusOK {
		t.Errorf("Expected successful log insertion, got status %d", w.Result().StatusCode)
	}

	// Check stats
	req = httptest.NewRequest("GET", "/stats", nil)
	w = httptest.NewRecorder()
	server.StatsHandler(w, req)

	if w.Result().StatusCode != http.StatusOK {
		t.Errorf("Expected successful stats retrieval, got status %d", w.Result().StatusCode)
	}

	var stats map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &stats); err == nil {
		if logsCount, ok := stats["logs_count"].(float64); ok && logsCount >= 1 {
			// Success - we have at least one log entry
		} else {
			t.Errorf("Expected at least 1 log entry in stats, got: %v", stats)
		}
	}
}
