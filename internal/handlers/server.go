package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"

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

	// Insert one record per log record, carrying resource attributes
	count, err := s.db.InsertLogsFromPayload(body)
	if err != nil {
		fmt.Printf("❌ Failed to store logs in database: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, `{"error":"failed to store logs"}`)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"partialSuccess":{},"inserted":%d}`, count)
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

	// Insert one record per span, carrying resource attributes
	count, err := s.db.InsertTracesFromPayload(body)
	if err != nil {
		fmt.Printf("❌ Failed to store traces in database: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, `{"error":"failed to store traces"}`)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"partialSuccess":{},"inserted":%d}`, count)
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

// CleanHandler deletes all data
func (s *Server) CleanHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	if err := s.db.ClearAll(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Failed to clear DB: %v", err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"ok":true}`)
}

// TracesHandler returns paginated traces as JSON (no auth) with CORS *
func (s *Server) TracesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	q := r.URL.Query()
	limit := 50
	offset := 0
	if v := q.Get("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 1000 {
			limit = n
		}
	}
	if v := q.Get("offset"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n >= 0 {
			offset = n
		}
	}

	records, err := s.db.GetTracesPaginated(limit, offset)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Failed to get traces: %v", err)
		return
	}

	results := make([]interface{}, len(records))

	for i, rec := range records {
		var data interface{}

		if err := json.Unmarshal([]byte(rec.Data), &data); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, "Failed to unmarshal data: %v", err)
			return
		}

		results[i] = data
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(results)
}

// TracesAllHandler returns all traces as JSON (no auth) with CORS *
func (s *Server) TracesAllHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	records, err := s.db.GetTracesAll()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Failed to get all traces: %v", err)
		return
	}

	results := make([]interface{}, len(records))

	for i, rec := range records {
		var data interface{}

		if err := json.Unmarshal([]byte(rec.Data), &data); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, "Failed to unmarshal data: %v", err)
			return
		}

		results[i] = data
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(results)
}

// LogsAllHandler returns all logs as JSON (no auth) with CORS *
// It unmarshals and returns only the JSON stored in the data column
func (s *Server) LogsAllHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	records, err := s.db.GetLogsAll()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Failed to get all logs: %v", err)
		return
	}

	results := make([]interface{}, len(records))

	for i, rec := range records {
		var data interface{}

		if err := json.Unmarshal([]byte(rec.Data), &data); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, "Failed to unmarshal data: %v", err)
			return
		}

		results[i] = data
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(results)
}

// LogsByTraceHandler returns logs filtered by traceId as JSON (no auth) with CORS *
// It unmarshals and returns only the JSON stored in the data column
func (s *Server) LogsByTraceHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	q := r.URL.Query()
	traceID := q.Get("traceId")
	if traceID == "" {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "missing traceId query param")
		return
	}

	records, err := s.db.GetLogsByTraceID(traceID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Failed to get logs by traceId: %v", err)
		return
	}

	results := make([]interface{}, len(records))

	for i, rec := range records {
		var data interface{}

		if err := json.Unmarshal([]byte(rec.Data), &data); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, "Failed to unmarshal data: %v", err)
			return
		}

		results[i] = data
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(results)
}
