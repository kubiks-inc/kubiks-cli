package database

const (
	// CreateLogsTable creates the simplified OTEL logs table
	CreateLogsTable = `
	CREATE TABLE IF NOT EXISTS otel_logs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		trace_id TEXT,
		timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
		data TEXT NOT NULL
	);`

	// CreateMetricsTable creates the simplified OTEL metrics table
	CreateMetricsTable = `
	CREATE TABLE IF NOT EXISTS otel_metrics (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		trace_id TEXT,
		timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
		data TEXT NOT NULL
	);`

	// CreateTracesTable creates the simplified OTEL traces table
	CreateTracesTable = `
	CREATE TABLE IF NOT EXISTS otel_traces (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		trace_id TEXT,
		timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
		data TEXT NOT NULL
	);`

	// CreateIndexes creates indexes for better query performance
	CreateIndexes = `
	CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON otel_logs(timestamp);
	CREATE INDEX IF NOT EXISTS idx_logs_trace_id ON otel_logs(trace_id);
	
	CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON otel_metrics(timestamp);
	CREATE INDEX IF NOT EXISTS idx_metrics_trace_id ON otel_metrics(trace_id);
	
	CREATE INDEX IF NOT EXISTS idx_traces_timestamp ON otel_traces(timestamp);
	CREATE INDEX IF NOT EXISTS idx_traces_trace_id ON otel_traces(trace_id);
	`
)