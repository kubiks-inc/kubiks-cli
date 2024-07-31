package handlers

import (
	"fmt"
	"io"
	"net/http"

	"github.com/kubiks-inc/kubiks-cli/internal/database"
	"github.com/kubiks-inc/kubiks-cli/pkg/types"
)

// Server represents the HTTP server with database connection
type Server struct {
	db   *database.DB
	port string
}

// NewServer creates a new server instance
func NewServer(port string) (*Server, error) {
	dbPath := types.GetDatabasePath()
	db, err := database.NewDB(dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize database: %w", err)
	}

	return &Server{
		db:   db,
		port: port,
	}, nil
}

// GetDB returns the database instance
func (s *Server) GetDB() *database.DB {
	return s.db
}

// Close closes the server resources
func (s *Server) Close() error {
	if s.db != nil {
		return s.db.Close()
	}
	return nil
}

// HelloHandler handles the root endpoint
func (s *Server) HelloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello World from Kubiks Server!\n")
	fmt.Fprintf(w, "Method: %s\n", r.Method)
	fmt.Fprintf(w, "URL: %s\n", r.URL.Path)
	fmt.Fprintf(w, "Server running on port %s\n", s.port)
}

// HealthHandler handles the health check endpoint
func (s *Server) HealthHandler(w http.ResponseWriter, r *http.Request) {
	// Check database connection
	if err := s.db.Ping(); err != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		fmt.Fprintf(w, "Database unavailable: %v", err)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "OK")
}

// OTELLogsHandler handles OTEL logs endpoint
func (s *Server) OTELLogsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	traceID := database.ExtractTraceID(body)

	_, err = s.db.InsertLog(traceID, string(body))
	if err != nil {
		fmt.Printf("❌ Failed to store log in database: %v\n", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"partialSuccess":{}}`)
}

// OTELMetricsHandler handles OTEL metrics endpoint
func (s *Server) OTELMetricsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	traceID := database.ExtractTraceID(body)

	_, err = s.db.InsertMetric(traceID, string(body))
	if err != nil {
		fmt.Printf("❌ Failed to store metric in database: %v\n", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"partialSuccess":{}}`)
}

// OTELTracesHandler handles OTEL traces endpoint
func (s *Server) OTELTracesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	traceID := database.ExtractTraceID(body)

	_, err = s.db.InsertTrace(traceID, string(body))
	if err != nil {
		fmt.Printf("❌ Failed to store trace in database: %v\n", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"partialSuccess":{}}`)
}

// StatsHandler returns database statistics
func (s *Server) StatsHandler(w http.ResponseWriter, r *http.Request) {
	stats, err := s.db.GetStats()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Failed to get stats: %v", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{
		"logs_count": %d,
		"metrics_count": %d,
		"traces_count": %d,
		"database_path": "%s"
	}`, stats["logs_count"], stats["metrics_count"], stats["traces_count"], types.GetDatabasePath())
}
