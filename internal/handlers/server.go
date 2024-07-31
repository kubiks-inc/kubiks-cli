package handlers

import (
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/kubiks-inc/kubiks-cli/internal/database"
)

// Server represents the HTTP server with database connection
type Server struct {
	db   *database.DB
	port string
}

// NewServer creates a new server instance
func NewServer(port string) (*Server, error) {
	db, err := database.NewDB("./kubiks_data.db")
	if err != nil {
		return nil, fmt.Errorf("failed to initialize database: %w", err)
	}

	return &Server{
		db:   db,
		port: port,
	}, nil
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

	fmt.Printf("\n🪵 [OTEL LOGS] Received at %s\n", time.Now().Format("15:04:05"))
	fmt.Printf("Content-Type: %s\n", r.Header.Get("Content-Type"))
	fmt.Printf("Content-Length: %d bytes\n", len(body))

	// Extract trace ID and service name for better logging
	traceID := database.ExtractTraceID(body)
	serviceName := database.ExtractServiceName(body)

	// Store raw JSON in database
	id, err := s.db.InsertLog(traceID, string(body))
	if err != nil {
		fmt.Printf("❌ Failed to store log in database: %v\n", err)
	} else {
		fmt.Printf("✅ Log stored in database (ID: %d, TraceID: %s, Service: %s)\n", id, traceID, serviceName)
	}

	// Display payload (truncated if too long)
	if len(body) > 0 && len(body) < 1000 {
		if pretty, err := database.PrettyPrintJSON(body); err == nil {
			fmt.Printf("Payload:\n%s\n", pretty)
		} else {
			fmt.Printf("Payload:\n%s\n", string(body))
		}
	} else if len(body) >= 1000 {
		fmt.Printf("Payload (truncated):\n%s...\n", string(body[:1000]))
	}
	fmt.Println("----------------------------------------")

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

	fmt.Printf("\n📊 [OTEL METRICS] Received at %s\n", time.Now().Format("15:04:05"))
	fmt.Printf("Content-Type: %s\n", r.Header.Get("Content-Type"))
	fmt.Printf("Content-Length: %d bytes\n", len(body))

	// Extract trace ID and service name for better logging
	traceID := database.ExtractTraceID(body)
	serviceName := database.ExtractServiceName(body)

	// Store raw JSON in database
	id, err := s.db.InsertMetric(traceID, string(body))
	if err != nil {
		fmt.Printf("❌ Failed to store metric in database: %v\n", err)
	} else {
		fmt.Printf("✅ Metric stored in database (ID: %d, TraceID: %s, Service: %s)\n", id, traceID, serviceName)
	}

	// Display payload (truncated if too long)
	if len(body) > 0 && len(body) < 1000 {
		if pretty, err := database.PrettyPrintJSON(body); err == nil {
			fmt.Printf("Payload:\n%s\n", pretty)
		} else {
			fmt.Printf("Payload:\n%s\n", string(body))
		}
	} else if len(body) >= 1000 {
		fmt.Printf("Payload (truncated):\n%s...\n", string(body[:1000]))
	}
	fmt.Println("----------------------------------------")

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

	fmt.Printf("\n🔍 [OTEL TRACES] Received at %s\n", time.Now().Format("15:04:05"))
	fmt.Printf("Content-Type: %s\n", r.Header.Get("Content-Type"))
	fmt.Printf("Content-Length: %d bytes\n", len(body))

	// Extract trace ID and service name for better logging
	traceID := database.ExtractTraceID(body)
	serviceName := database.ExtractServiceName(body)

	// Store raw JSON in database
	id, err := s.db.InsertTrace(traceID, string(body))
	if err != nil {
		fmt.Printf("❌ Failed to store trace in database: %v\n", err)
	} else {
		fmt.Printf("✅ Trace stored in database (ID: %d, TraceID: %s, Service: %s)\n", id, traceID, serviceName)
	}

	// Display payload (truncated if too long)
	if len(body) > 0 && len(body) < 1000 {
		if pretty, err := database.PrettyPrintJSON(body); err == nil {
			fmt.Printf("Payload:\n%s\n", pretty)
		} else {
			fmt.Printf("Payload:\n%s\n", string(body))
		}
	} else if len(body) >= 1000 {
		fmt.Printf("Payload (truncated):\n%s...\n", string(body[:1000]))
	}
	fmt.Println("----------------------------------------")

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
		"database_path": "./kubiks_data.db"
	}`, stats["logs_count"], stats["metrics_count"], stats["traces_count"])
}