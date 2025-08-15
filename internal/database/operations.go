package database

import (
	"database/sql"
	"fmt"
)

// InsertLog inserts a log record into the database
func (db *DB) InsertLog(traceID, data string) (int64, error) {
	serviceName := ExtractServiceName([]byte(data))
	query := `INSERT INTO otel_logs (trace_id, servicename, data) VALUES (?, ?, ?)`

	result, err := db.conn.Exec(query, traceID, serviceName, data)
	if err != nil {
		return 0, fmt.Errorf("failed to insert log: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("failed to get last insert ID: %w", err)
	}

	return id, nil
}

// InsertMetric inserts a metric record into the database
func (db *DB) InsertMetric(traceID, data string) (int64, error) {
	serviceName := ExtractServiceName([]byte(data))
	query := `INSERT INTO otel_metrics (trace_id, servicename, data) VALUES (?, ?, ?)`

	result, err := db.conn.Exec(query, traceID, serviceName, data)
	if err != nil {
		return 0, fmt.Errorf("failed to insert metric: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("failed to get last insert ID: %w", err)
	}

	return id, nil
}

// InsertTrace inserts a trace record into the database
func (db *DB) InsertTrace(traceID, data string) (int64, error) {
	serviceName := ExtractServiceName([]byte(data))
	query := `INSERT INTO otel_traces (trace_id, servicename, data) VALUES (?, ?, ?)`

	result, err := db.conn.Exec(query, traceID, serviceName, data)
	if err != nil {
		return 0, fmt.Errorf("failed to insert trace: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("failed to get last insert ID: %w", err)
	}

	return id, nil
}

// GetStats returns database statistics
func (db *DB) GetStats() (map[string]int64, error) {
	stats := make(map[string]int64)

	queries := map[string]string{
		"logs_count":    "SELECT COUNT(*) FROM otel_logs",
		"metrics_count": "SELECT COUNT(*) FROM otel_metrics",
		"traces_count":  "SELECT COUNT(*) FROM otel_traces",
	}

	for key, query := range queries {
		var count int64
		err := db.conn.QueryRow(query).Scan(&count)
		if err != nil {
			return nil, fmt.Errorf("failed to get %s: %w", key, err)
		}
		stats[key] = count
	}

	return stats, nil
}

// BeginTx starts a new transaction
func (db *DB) BeginTx() (*sql.Tx, error) {
	return db.conn.Begin()
}

// getPaginatedByService is a generic function to retrieve OTEL records with pagination filtered by service name
func (db *DB) getPaginatedByService(tableName, serviceName string, limit, offset int) ([]*OTELRecord, error) {
	query := fmt.Sprintf(`SELECT id, trace_id, servicename, timestamp, data FROM %s 
		WHERE servicename = ? 
		ORDER BY timestamp DESC LIMIT ? OFFSET ?`, tableName)

	rows, err := db.conn.Query(query, serviceName, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query %s for service %s: %w", tableName, serviceName, err)
	}
	defer rows.Close()

	var records []*OTELRecord
	for rows.Next() {
		record := &OTELRecord{}
		err := rows.Scan(&record.ID, &record.TraceID, &record.ServiceName, &record.Timestamp, &record.Data)
		if err != nil {
			return nil, fmt.Errorf("failed to scan %s row: %w", tableName, err)
		}
		records = append(records, record)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating %s rows: %w", tableName, err)
	}

	return records, nil
}

// GetLogsPaginatedByService retrieves logs with pagination filtered by service name
func (db *DB) GetLogsPaginatedByService(serviceName string, limit, offset int) ([]*OTELRecord, error) {
	return db.getPaginatedByService("otel_logs", serviceName, limit, offset)
}

// GetMetricsPaginatedByService retrieves metrics with pagination filtered by service name
func (db *DB) GetMetricsPaginatedByService(serviceName string, limit, offset int) ([]*OTELRecord, error) {
	return db.getPaginatedByService("otel_metrics", serviceName, limit, offset)
}

// GetTracesPaginatedByService retrieves traces with pagination filtered by service name
func (db *DB) GetTracesPaginatedByService(serviceName string, limit, offset int) ([]*OTELRecord, error) {
	return db.getPaginatedByService("otel_traces", serviceName, limit, offset)
}

// GetDB returns the underlying database connection for advanced operations
func (db *DB) GetDB() *sql.DB {
	return db.conn
}

// GetTracesPaginated retrieves traces with pagination across all services
func (db *DB) GetTracesPaginated(limit, offset int) ([]*OTELRecord, error) {
	query := `SELECT id, trace_id, servicename, timestamp, data FROM otel_traces 
		ORDER BY timestamp DESC LIMIT ? OFFSET ?`

	rows, err := db.conn.Query(query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query otel_traces: %w", err)
	}
	defer rows.Close()

	var records []*OTELRecord
	for rows.Next() {
		record := &OTELRecord{}
		err := rows.Scan(&record.ID, &record.TraceID, &record.ServiceName, &record.Timestamp, &record.Data)
		if err != nil {
			return nil, fmt.Errorf("failed to scan otel_traces row: %w", err)
		}
		records = append(records, record)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating otel_traces rows: %w", err)
	}

	return records, nil
}

// ClearAll removes all data from OTEL tables
func (db *DB) ClearAll() error {
	tx, err := db.conn.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin tx: %w", err)
	}
	stmts := []string{
		"DELETE FROM otel_logs",
		"DELETE FROM otel_metrics",
		"DELETE FROM otel_traces",
	}
	for _, s := range stmts {
		if _, err := tx.Exec(s); err != nil {
			_ = tx.Rollback()
			return fmt.Errorf("failed to execute '%s': %w", s, err)
		}
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit clear all: %w", err)
	}
	return nil
}
