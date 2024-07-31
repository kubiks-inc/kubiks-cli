package database

import (
	"os"
	"path/filepath"
	"testing"
)

func setupTestDB(t *testing.T) (*DB, func()) {
	tempDir, err := os.MkdirTemp("", "kubiks-operations-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}

	dbPath := filepath.Join(tempDir, "test.db")
	db, err := NewDB(dbPath)
	if err != nil {
		t.Fatalf("NewDB() error = %v", err)
	}

	cleanup := func() {
		db.Close()
		os.RemoveAll(tempDir)
	}

	return db, cleanup
}

func TestDB_InsertLog(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	testData := `{"resourceLogs":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"test-service"}}]},"scopeLogs":[{"logRecords":[{"timeUnixNano":"1609459200000000000","body":{"stringValue":"Test log message"}}]}]}]}`
	traceID := "trace123"

	id, err := db.InsertLog(traceID, testData)
	if err != nil {
		t.Errorf("InsertLog() error = %v", err)
	}

	if id <= 0 {
		t.Errorf("InsertLog() returned invalid ID = %d", id)
	}

	// Verify the log was inserted
	var count int
	err = db.conn.QueryRow("SELECT COUNT(*) FROM otel_logs WHERE trace_id = ?", traceID).Scan(&count)
	if err != nil {
		t.Errorf("Failed to query inserted log: %v", err)
	}

	if count != 1 {
		t.Errorf("Expected 1 log, got %d", count)
	}
}

func TestDB_InsertMetric(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	testData := `{"resourceMetrics":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"test-service"}}]},"scopeMetrics":[{"metrics":[{"name":"test.metric","sum":{"aggregationTemporality":2,"dataPoints":[{"timeUnixNano":"1609459200000000000","asDouble":42.0}]}}]}]}]}`
	traceID := "trace456"

	id, err := db.InsertMetric(traceID, testData)
	if err != nil {
		t.Errorf("InsertMetric() error = %v", err)
	}

	if id <= 0 {
		t.Errorf("InsertMetric() returned invalid ID = %d", id)
	}

	// Verify the metric was inserted
	var count int
	err = db.conn.QueryRow("SELECT COUNT(*) FROM otel_metrics WHERE trace_id = ?", traceID).Scan(&count)
	if err != nil {
		t.Errorf("Failed to query inserted metric: %v", err)
	}

	if count != 1 {
		t.Errorf("Expected 1 metric, got %d", count)
	}
}

func TestDB_InsertTrace(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	testData := `{"resourceSpans":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"test-service"}}]},"scopeSpans":[{"spans":[{"traceId":"abc123","spanId":"def456","name":"test.span","startTimeUnixNano":"1609459200000000000","endTimeUnixNano":"1609459201000000000"}]}]}]}`
	traceID := "trace789"

	id, err := db.InsertTrace(traceID, testData)
	if err != nil {
		t.Errorf("InsertTrace() error = %v", err)
	}

	if id <= 0 {
		t.Errorf("InsertTrace() returned invalid ID = %d", id)
	}

	// Verify the trace was inserted
	var count int
	err = db.conn.QueryRow("SELECT COUNT(*) FROM otel_traces WHERE trace_id = ?", traceID).Scan(&count)
	if err != nil {
		t.Errorf("Failed to query inserted trace: %v", err)
	}

	if count != 1 {
		t.Errorf("Expected 1 trace, got %d", count)
	}
}

func TestDB_GetStats(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	// Insert some test data
	testLogData := `{"resourceLogs":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"test-service"}}]},"scopeLogs":[{"logRecords":[{"timeUnixNano":"1609459200000000000","body":{"stringValue":"Test log"}}]}]}]}`
	testMetricData := `{"resourceMetrics":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"test-service"}}]},"scopeMetrics":[{"metrics":[{"name":"test.metric"}]}]}]}`
	testTraceData := `{"resourceSpans":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"test-service"}}]},"scopeSpans":[{"spans":[{"name":"test.span"}]}]}]}`

	// Insert multiple records
	for i := 0; i < 3; i++ {
		_, err := db.InsertLog("trace-log", testLogData)
		if err != nil {
			t.Fatalf("Failed to insert log %d: %v", i, err)
		}
	}

	for i := 0; i < 2; i++ {
		_, err := db.InsertMetric("trace-metric", testMetricData)
		if err != nil {
			t.Fatalf("Failed to insert metric %d: %v", i, err)
		}
	}

	_, err := db.InsertTrace("trace-trace", testTraceData)
	if err != nil {
		t.Fatalf("Failed to insert trace: %v", err)
	}

	// Test GetStats
	stats, err := db.GetStats()
	if err != nil {
		t.Errorf("GetStats() error = %v", err)
	}

	expectedStats := map[string]int64{
		"logs_count":    3,
		"metrics_count": 2,
		"traces_count":  1,
	}

	for key, expected := range expectedStats {
		if stats[key] != expected {
			t.Errorf("GetStats()[%s] = %d, want %d", key, stats[key], expected)
		}
	}
}

func TestDB_GetLogsPaginatedByService(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	// Insert test data for different services
	service1Data := `{"resourceLogs":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"service-1"}}]},"scopeLogs":[{"logRecords":[{"body":{"stringValue":"Log from service 1"}}]}]}]}`
	service2Data := `{"resourceLogs":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"service-2"}}]},"scopeLogs":[{"logRecords":[{"body":{"stringValue":"Log from service 2"}}]}]}]}`

	// Insert multiple logs for each service
	for i := 0; i < 5; i++ {
		_, err := db.InsertLog("trace-s1", service1Data)
		if err != nil {
			t.Fatalf("Failed to insert service-1 log %d: %v", i, err)
		}
	}

	for i := 0; i < 3; i++ {
		_, err := db.InsertLog("trace-s2", service2Data)
		if err != nil {
			t.Fatalf("Failed to insert service-2 log %d: %v", i, err)
		}
	}

	// Test pagination for service-1
	logs, err := db.GetLogsPaginatedByService("service-1", 3, 0)
	if err != nil {
		t.Errorf("GetLogsPaginatedByService() error = %v", err)
	}

	if len(logs) != 3 {
		t.Errorf("Expected 3 logs, got %d", len(logs))
	}

	// Verify all logs are for service-1
	for _, log := range logs {
		if log.ServiceName != "service-1" {
			t.Errorf("Expected service name 'service-1', got '%s'", log.ServiceName)
		}
	}

	// Test second page
	logsPage2, err := db.GetLogsPaginatedByService("service-1", 3, 3)
	if err != nil {
		t.Errorf("GetLogsPaginatedByService() page 2 error = %v", err)
	}

	if len(logsPage2) != 2 {
		t.Errorf("Expected 2 logs on page 2, got %d", len(logsPage2))
	}

	// Test for service-2
	service2Logs, err := db.GetLogsPaginatedByService("service-2", 10, 0)
	if err != nil {
		t.Errorf("GetLogsPaginatedByService() service-2 error = %v", err)
	}

	if len(service2Logs) != 3 {
		t.Errorf("Expected 3 service-2 logs, got %d", len(service2Logs))
	}
}

func TestDB_GetMetricsPaginatedByService(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	testData := `{"resourceMetrics":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"metrics-service"}}]},"scopeMetrics":[{"metrics":[{"name":"test.metric"}]}]}]}`

	// Insert test metrics
	for i := 0; i < 4; i++ {
		_, err := db.InsertMetric("trace-metrics", testData)
		if err != nil {
			t.Fatalf("Failed to insert metric %d: %v", i, err)
		}
	}

	// Test pagination
	metrics, err := db.GetMetricsPaginatedByService("metrics-service", 2, 0)
	if err != nil {
		t.Errorf("GetMetricsPaginatedByService() error = %v", err)
	}

	if len(metrics) != 2 {
		t.Errorf("Expected 2 metrics, got %d", len(metrics))
	}

	// Test second page
	metricsPage2, err := db.GetMetricsPaginatedByService("metrics-service", 2, 2)
	if err != nil {
		t.Errorf("GetMetricsPaginatedByService() page 2 error = %v", err)
	}

	if len(metricsPage2) != 2 {
		t.Errorf("Expected 2 metrics on page 2, got %d", len(metricsPage2))
	}
}

func TestDB_GetTracesPaginatedByService(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	testData := `{"resourceSpans":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"traces-service"}}]},"scopeSpans":[{"spans":[{"name":"test.span"}]}]}]}`

	// Insert test traces
	for i := 0; i < 3; i++ {
		_, err := db.InsertTrace("trace-spans", testData)
		if err != nil {
			t.Fatalf("Failed to insert trace %d: %v", i, err)
		}
	}

	// Test pagination
	traces, err := db.GetTracesPaginatedByService("traces-service", 10, 0)
	if err != nil {
		t.Errorf("GetTracesPaginatedByService() error = %v", err)
	}

	if len(traces) != 3 {
		t.Errorf("Expected 3 traces, got %d", len(traces))
	}

	// Verify all traces are for the correct service
	for _, trace := range traces {
		if trace.ServiceName != "traces-service" {
			t.Errorf("Expected service name 'traces-service', got '%s'", trace.ServiceName)
		}
	}
}

func TestDB_GetDB(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	sqlDB := db.GetDB()
	if sqlDB == nil {
		t.Error("GetDB() returned nil")
	}

	// Verify it's the same connection
	if sqlDB != db.conn {
		t.Error("GetDB() returned different connection than internal conn")
	}

	// Verify the connection works
	if err := sqlDB.Ping(); err != nil {
		t.Errorf("GetDB() connection ping failed: %v", err)
	}
}