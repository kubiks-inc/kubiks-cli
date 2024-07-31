package database

import (
	"database/sql"
	"fmt"
)

// InsertLog inserts a log record into the database
func (db *DB) InsertLog(traceID, data string) (int64, error) {
	query := `INSERT INTO otel_logs (trace_id, data) VALUES (?, ?)`
	
	result, err := db.conn.Exec(query, traceID, data)
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
	query := `INSERT INTO otel_metrics (trace_id, data) VALUES (?, ?)`
	
	result, err := db.conn.Exec(query, traceID, data)
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
	query := `INSERT INTO otel_traces (trace_id, data) VALUES (?, ?)`
	
	result, err := db.conn.Exec(query, traceID, data)
	if err != nil {
		return 0, fmt.Errorf("failed to insert trace: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("failed to get last insert ID: %w", err)
	}

	return id, nil
}

// GetRecentLogs retrieves recent log entries
func (db *DB) GetRecentLogs(limit int) ([]*OTELRecord, error) {
	query := `SELECT id, trace_id, timestamp, data FROM otel_logs ORDER BY timestamp DESC LIMIT ?`

	rows, err := db.conn.Query(query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query logs: %w", err)
	}
	defer rows.Close()

	var records []*OTELRecord
	for rows.Next() {
		record := &OTELRecord{}
		err := rows.Scan(&record.ID, &record.TraceID, &record.Timestamp, &record.Data)
		if err != nil {
			return nil, fmt.Errorf("failed to scan log row: %w", err)
		}
		records = append(records, record)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating log rows: %w", err)
	}

	return records, nil
}

// GetRecentMetrics retrieves recent metric entries
func (db *DB) GetRecentMetrics(limit int) ([]*OTELRecord, error) {
	query := `SELECT id, trace_id, timestamp, data FROM otel_metrics ORDER BY timestamp DESC LIMIT ?`

	rows, err := db.conn.Query(query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query metrics: %w", err)
	}
	defer rows.Close()

	var records []*OTELRecord
	for rows.Next() {
		record := &OTELRecord{}
		err := rows.Scan(&record.ID, &record.TraceID, &record.Timestamp, &record.Data)
		if err != nil {
			return nil, fmt.Errorf("failed to scan metric row: %w", err)
		}
		records = append(records, record)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating metric rows: %w", err)
	}

	return records, nil
}

// GetRecentTraces retrieves recent trace entries
func (db *DB) GetRecentTraces(limit int) ([]*OTELRecord, error) {
	query := `SELECT id, trace_id, timestamp, data FROM otel_traces ORDER BY timestamp DESC LIMIT ?`

	rows, err := db.conn.Query(query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query traces: %w", err)
	}
	defer rows.Close()

	var records []*OTELRecord
	for rows.Next() {
		record := &OTELRecord{}
		err := rows.Scan(&record.ID, &record.TraceID, &record.Timestamp, &record.Data)
		if err != nil {
			return nil, fmt.Errorf("failed to scan trace row: %w", err)
		}
		records = append(records, record)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating trace rows: %w", err)
	}

	return records, nil
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

// GetLogsPaginated retrieves logs with pagination
func (db *DB) GetLogsPaginated(limit, offset int) ([]*OTELRecord, error) {
	query := `SELECT id, trace_id, timestamp, data FROM otel_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?`

	rows, err := db.conn.Query(query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query logs: %w", err)
	}
	defer rows.Close()

	var records []*OTELRecord
	for rows.Next() {
		record := &OTELRecord{}
		err := rows.Scan(&record.ID, &record.TraceID, &record.Timestamp, &record.Data)
		if err != nil {
			return nil, fmt.Errorf("failed to scan log row: %w", err)
		}
		records = append(records, record)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating log rows: %w", err)
	}

	return records, nil
}

// GetMetricsPaginated retrieves metrics with pagination
func (db *DB) GetMetricsPaginated(limit, offset int) ([]*OTELRecord, error) {
	query := `SELECT id, trace_id, timestamp, data FROM otel_metrics ORDER BY timestamp DESC LIMIT ? OFFSET ?`

	rows, err := db.conn.Query(query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query metrics: %w", err)
	}
	defer rows.Close()

	var records []*OTELRecord
	for rows.Next() {
		record := &OTELRecord{}
		err := rows.Scan(&record.ID, &record.TraceID, &record.Timestamp, &record.Data)
		if err != nil {
			return nil, fmt.Errorf("failed to scan metric row: %w", err)
		}
		records = append(records, record)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating metric rows: %w", err)
	}

	return records, nil
}

// GetTracesPaginated retrieves traces with pagination
func (db *DB) GetTracesPaginated(limit, offset int) ([]*OTELRecord, error) {
	query := `SELECT id, trace_id, timestamp, data FROM otel_traces ORDER BY timestamp DESC LIMIT ? OFFSET ?`

	rows, err := db.conn.Query(query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query traces: %w", err)
	}
	defer rows.Close()

	var records []*OTELRecord
	for rows.Next() {
		record := &OTELRecord{}
		err := rows.Scan(&record.ID, &record.TraceID, &record.Timestamp, &record.Data)
		if err != nil {
			return nil, fmt.Errorf("failed to scan trace row: %w", err)
		}
		records = append(records, record)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating trace rows: %w", err)
	}

	return records, nil
}

// GetDB returns the underlying database connection for advanced operations
func (db *DB) GetDB() *sql.DB {
	return db.conn
}