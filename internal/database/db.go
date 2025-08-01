package database

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

// DB wraps the database connection and provides OTEL-specific methods
type DB struct {
	conn *sql.DB
}

// NewDB creates a new database connection and initializes the schema
func NewDB(dbPath string) (*DB, error) {
	// Ensure the directory exists
	if err := os.MkdirAll(filepath.Dir(dbPath), 0755); err != nil {
		return nil, fmt.Errorf("failed to create database directory: %w", err)
	}

	// Open database connection
	conn, err := sql.Open("sqlite3", dbPath+"?_journal_mode=WAL&_timeout=5000&_synchronous=NORMAL")
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Configure connection pool
	conn.SetMaxOpenConns(10)
	conn.SetMaxIdleConns(5)

	db := &DB{conn: conn}

	// Initialize schema
	if err := db.initSchema(); err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to initialize schema: %w", err)
	}

	return db, nil
}

// Close closes the database connection
func (db *DB) Close() error {
	if db.conn != nil {
		return db.conn.Close()
	}
	return nil
}

// initSchema creates tables and indexes
func (db *DB) initSchema() error {
	// Create tables
	for _, query := range []string{CreateLogsTable, CreateMetricsTable, CreateTracesTable} {
		if _, err := db.conn.Exec(query); err != nil {
			return fmt.Errorf("failed to create table: %w", err)
		}
	}

	// Run migrations for existing databases
	if err := db.runMigrations(); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	// Create indexes
	if _, err := db.conn.Exec(CreateIndexes); err != nil {
		return fmt.Errorf("failed to create indexes: %w", err)
	}

	return nil
}

// runMigrations handles database schema migrations
func (db *DB) runMigrations() error {
	// Migration 1: Add servicename column if it doesn't exist
	migrations := []string{
		// Add servicename column to otel_logs if it doesn't exist
		`ALTER TABLE otel_logs ADD COLUMN servicename TEXT DEFAULT 'unknown'`,
		// Add servicename column to otel_metrics if it doesn't exist
		`ALTER TABLE otel_metrics ADD COLUMN servicename TEXT DEFAULT 'unknown'`,
		// Add servicename column to otel_traces if it doesn't exist
		`ALTER TABLE otel_traces ADD COLUMN servicename TEXT DEFAULT 'unknown'`,
	}

	for _, migration := range migrations {
		// Ignore errors for columns that already exist
		db.conn.Exec(migration)
	}

	// Update the default value to NOT NULL for new rows after migration
	// SQLite doesn't support modifying column constraints, so we'll handle this in insert operations

	return nil
}

// Ping tests the database connection
func (db *DB) Ping() error {
	return db.conn.Ping()
}
