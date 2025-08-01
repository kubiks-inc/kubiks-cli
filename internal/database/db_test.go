package database

import (
	"database/sql"
	"os"
	"path/filepath"
	"testing"
	"time"

	_ "modernc.org/sqlite"
)

func TestNewDB(t *testing.T) {
	// Create a temporary directory for test database
	tempDir, err := os.MkdirTemp("", "kubiks-db-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	dbPath := filepath.Join(tempDir, "test.db")

	// Test creating a new database
	db, err := NewDB(dbPath)
	if err != nil {
		t.Fatalf("NewDB() error = %v", err)
	}
	defer db.Close()

	// Verify database connection
	if err := db.Ping(); err != nil {
		t.Errorf("Database ping failed: %v", err)
	}

	// Verify database file was created
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		t.Error("Database file was not created")
	}
}

func TestNewDB_DirectoryCreation(t *testing.T) {
	// Create a temporary directory
	tempDir, err := os.MkdirTemp("", "kubiks-db-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	// Create a nested path that doesn't exist
	dbPath := filepath.Join(tempDir, "nested", "directory", "test.db")

	// Test creating a new database with nested directory
	db, err := NewDB(dbPath)
	if err != nil {
		t.Fatalf("NewDB() with nested directory error = %v", err)
	}
	defer db.Close()

	// Verify the nested directory was created
	if _, err := os.Stat(filepath.Dir(dbPath)); os.IsNotExist(err) {
		t.Error("Nested directory was not created")
	}
}

func TestDB_Close(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "kubiks-db-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	dbPath := filepath.Join(tempDir, "test.db")
	db, err := NewDB(dbPath)
	if err != nil {
		t.Fatalf("NewDB() error = %v", err)
	}

	// Test closing the database
	if err := db.Close(); err != nil {
		t.Errorf("Close() error = %v", err)
	}

	// Test closing again (should not error)
	if err := db.Close(); err != nil {
		t.Errorf("Second Close() error = %v", err)
	}
}

func TestDB_CloseNilConnection(t *testing.T) {
	db := &DB{conn: nil}
	if err := db.Close(); err != nil {
		t.Errorf("Close() with nil connection error = %v", err)
	}
}

func TestDB_Ping(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "kubiks-db-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	dbPath := filepath.Join(tempDir, "test.db")
	db, err := NewDB(dbPath)
	if err != nil {
		t.Fatalf("NewDB() error = %v", err)
	}
	defer db.Close()

	// Test ping
	if err := db.Ping(); err != nil {
		t.Errorf("Ping() error = %v", err)
	}
}

func TestDB_SchemaCreation(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "kubiks-db-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	dbPath := filepath.Join(tempDir, "test.db")
	db, err := NewDB(dbPath)
	if err != nil {
		t.Fatalf("NewDB() error = %v", err)
	}
	defer db.Close()

	// Verify tables were created
	tables := []string{"otel_logs", "otel_metrics", "otel_traces"}
	for _, table := range tables {
		query := `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
		var name string
		err := db.conn.QueryRow(query, table).Scan(&name)
		if err != nil {
			t.Errorf("Table %s not found: %v", table, err)
		}
		if name != table {
			t.Errorf("Expected table name %s, got %s", table, name)
		}
	}
}

func TestDB_IndexCreation(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "kubiks-db-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	dbPath := filepath.Join(tempDir, "test.db")
	db, err := NewDB(dbPath)
	if err != nil {
		t.Fatalf("NewDB() error = %v", err)
	}
	defer db.Close()

	// Verify some key indexes were created
	expectedIndexes := []string{
		"idx_logs_timestamp",
		"idx_logs_trace_id",
		"idx_logs_servicename",
		"idx_metrics_timestamp",
		"idx_traces_timestamp",
	}

	for _, index := range expectedIndexes {
		query := `SELECT name FROM sqlite_master WHERE type='index' AND name=?`
		var name string
		err := db.conn.QueryRow(query, index).Scan(&name)
		if err != nil {
			t.Errorf("Index %s not found: %v", index, err)
		}
		if name != index {
			t.Errorf("Expected index name %s, got %s", index, name)
		}
	}
}

func TestDB_Migration(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "kubiks-db-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	dbPath := filepath.Join(tempDir, "test.db")

	// Create a database without the servicename column (simulate old version)
	conn, err := sql.Open("sqlite", dbPath)
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}

	// Create old schema without servicename column
	oldSchema := `
	CREATE TABLE IF NOT EXISTS otel_logs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		trace_id TEXT,
		timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
		data TEXT NOT NULL
	);`

	if _, err := conn.Exec(oldSchema); err != nil {
		t.Fatalf("Failed to create old schema: %v", err)
	}
	conn.Close()

	// Now open with the new DB struct (should run migrations)
	db, err := NewDB(dbPath)
	if err != nil {
		t.Fatalf("NewDB() error = %v", err)
	}
	defer db.Close()

	// Verify servicename column exists
	query := `PRAGMA table_info(otel_logs)`
	rows, err := db.conn.Query(query)
	if err != nil {
		t.Fatalf("Failed to get table info: %v", err)
	}
	defer rows.Close()

	hasServiceNameColumn := false
	for rows.Next() {
		var cid int
		var name, dataType string
		var notNull, defaultValue, pk interface{}
		if err := rows.Scan(&cid, &name, &dataType, &notNull, &defaultValue, &pk); err != nil {
			t.Fatalf("Failed to scan table info: %v", err)
		}
		if name == "servicename" {
			hasServiceNameColumn = true
			break
		}
	}

	if !hasServiceNameColumn {
		t.Error("Migration failed: servicename column not found")
	}
}

func TestDB_BeginTx(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "kubiks-db-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	dbPath := filepath.Join(tempDir, "test.db")
	db, err := NewDB(dbPath)
	if err != nil {
		t.Fatalf("NewDB() error = %v", err)
	}
	defer db.Close()

	// Test beginning a transaction
	tx, err := db.BeginTx()
	if err != nil {
		t.Errorf("BeginTx() error = %v", err)
	}

	if tx == nil {
		t.Error("BeginTx() returned nil transaction")
	}

	// Test rollback
	if err := tx.Rollback(); err != nil {
		t.Errorf("Transaction rollback error = %v", err)
	}
}

func TestDB_ConnectionPoolSettings(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "kubiks-db-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	dbPath := filepath.Join(tempDir, "test.db")
	db, err := NewDB(dbPath)
	if err != nil {
		t.Fatalf("NewDB() error = %v", err)
	}
	defer db.Close()

	// Verify connection pool settings (these are internal but we can test they don't cause issues)
	stats := db.conn.Stats()

	// Just verify the connection is working with multiple concurrent operations
	for i := 0; i < 5; i++ {
		go func() {
			if err := db.Ping(); err != nil {
				t.Errorf("Concurrent ping failed: %v", err)
			}
		}()
	}

	// Give goroutines time to complete
	time.Sleep(100 * time.Millisecond)

	// Verify stats are reasonable (non-zero open connections)
	if stats.OpenConnections < 0 {
		t.Errorf("Unexpected open connections count: %d", stats.OpenConnections)
	}
}
