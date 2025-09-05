package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/kubiks-inc/kubiks-cli/internal/database"
	"github.com/kubiks-inc/kubiks-cli/pkg/types"
)

// Server represents the HTTP server with database connection
type Server struct {
	db   *database.DB
	port string
	// mirroring config
	mirrorEnabled    bool
	mirrorTracesURL  string
	mirrorLogsURL    string
	mirrorHeadersRaw string
}

// NewServer creates a new server instance
func NewServer(port string) (*Server, error) {
	dbPath := types.GetDatabasePath()
	db, err := database.NewDB(dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize database: %w", err)
	}

	s := &Server{
		db:   db,
		port: port,
	}

	// Resolve mirroring configuration from .env.local/.env
	base, tracesURL, logsURL, headers := resolveMirrorConfig()
	// Enable mirroring if any remote target is non-empty and not pointing to our own OTEL port
	if tracesURL != "" || logsURL != "" {
		// avoid self-loop to local server
		if !isLocalOTELURL(tracesURL, port) || !isLocalOTELURL(logsURL, port) {
			s.mirrorEnabled = true
			s.mirrorTracesURL = tracesURL
			s.mirrorLogsURL = logsURL
			s.mirrorHeadersRaw = headers
			if s.mirrorTracesURL != "" || s.mirrorLogsURL != "" {
				fmt.Printf("🔁 OTLP mirroring enabled to base %s (traces=%s logs=%s)\n", base, s.mirrorTracesURL, s.mirrorLogsURL)
			}
		}
	}

	return s, nil
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

	// Mirror to remote logs endpoint if enabled
	if s.mirrorEnabled && s.mirrorLogsURL != "" && !isLocalOTELURL(s.mirrorLogsURL, s.port) {
		go s.forwardOTLPJSON(s.mirrorLogsURL, body, s.mirrorHeadersRaw)
	}
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

	// Mirror to remote traces endpoint if enabled
	if s.mirrorEnabled && s.mirrorTracesURL != "" && !isLocalOTELURL(s.mirrorTracesURL, s.port) {
		go s.forwardOTLPJSON(s.mirrorTracesURL, body, s.mirrorHeadersRaw)
	}
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

// forwardOTLPJSON forwards an OTLP HTTP JSON payload to the given URL with optional headers
func (s *Server) forwardOTLPJSON(targetURL string, payload []byte, headersRaw string) {
	if targetURL == "" {
		return
	}
	req, err := http.NewRequest("POST", targetURL, bytes.NewReader(payload))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	// headers string format: key=value,key2=value2
	for _, kv := range strings.Split(headersRaw, ",") {
		kv = strings.TrimSpace(kv)
		if kv == "" {
			continue
		}
		parts := strings.SplitN(kv, "=", 2)
		if len(parts) == 2 {
			req.Header.Set(parts[0], parts[1])
		}
	}
	client := &http.Client{}
	_, _ = client.Do(req)
}

// resolveMirrorConfig loads .env files to determine remote OTLP endpoints for mirroring
// Precedence: .env.local then .env
func resolveMirrorConfig() (base string, tracesURL string, logsURL string, headers string) {
	vals := loadDotEnvFiles([]string{".env.local", ".env"})
	base = vals["OTEL_EXPORTER_OTLP_ENDPOINT"]
	if base == "" {
		base = ""
	}
	tracesURL = vals["OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"]
	logsURL = vals["OTEL_EXPORTER_OTLP_LOGS_ENDPOINT"]
	if tracesURL == "" && base != "" {
		tracesURL = normalizeOTLPEndpoint(base, "traces")
	}
	if logsURL == "" && base != "" {
		logsURL = normalizeOTLPEndpoint(base, "logs")
	}
	headers = vals["OTEL_EXPORTER_OTLP_HEADERS"]
	return
}

// isLocalOTELURL returns true if the URL points to this server's OTEL port
func isLocalOTELURL(raw string, otelPort string) bool {
	if raw == "" {
		return false
	}
	u, err := url.Parse(raw)
	if err != nil {
		return false
	}
	host := u.Host
	return strings.Contains(host, ":"+otelPort)
}

// normalizeOTLPEndpoint appends /v1/<signal> when given a base URL
func normalizeOTLPEndpoint(raw string, signal string) string {
	if raw == "" {
		return ""
	}
	u, err := url.Parse(raw)
	if err != nil {
		return raw
	}
	p := u.Path
	if strings.HasSuffix(p, "/v1/"+signal) {
		return raw
	}
	if p == "" || p == "/" {
		u.Path = "/v1/" + signal
		return u.String()
	}
	if p == "/v1" || p == "/v1/" {
		u.Path = "/v1/" + signal
		return u.String()
	}
	if strings.HasPrefix(p, "/v1/") && !strings.Contains(p, "/v1/traces") && !strings.Contains(p, "/v1/logs") {
		if strings.HasSuffix(p, "/") {
			u.Path = p + signal
		} else {
			u.Path = p + "/" + signal
		}
		return u.String()
	}
	return raw
}

// loadDotEnvFiles is a lightweight parser for KEY=VALUE env files
func loadDotEnvFiles(files []string) map[string]string {
	values := make(map[string]string)
	setIfEmpty := func(k, v string) {
		if k == "" || v == "" {
			return
		}
		if _, exists := values[k]; !exists {
			values[k] = v
		}
	}
	for _, name := range files {
		data, err := os.ReadFile(filepath.Join(".", name))
		if err != nil {
			continue
		}
		lines := strings.Split(string(data), "\n")
		for _, line := range lines {
			line = strings.TrimSpace(line)
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			if strings.HasPrefix(line, "export ") {
				line = strings.TrimSpace(strings.TrimPrefix(line, "export "))
			}
			idx := strings.Index(line, "=")
			if idx <= 0 {
				continue
			}
			k := strings.TrimSpace(line[:idx])
			v := strings.TrimSpace(line[idx+1:])
			if len(v) >= 2 {
				if (strings.HasPrefix(v, "\"") && strings.HasSuffix(v, "\"")) || (strings.HasPrefix(v, "'")) && strings.HasSuffix(v, "'") {
					v = v[1 : len(v)-1]
				}
			}
			setIfEmpty(k, v)
		}
	}
	return values
}
