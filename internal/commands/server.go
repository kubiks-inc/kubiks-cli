package commands

import (
	"fmt"
	"os"
	"os/exec"
	"syscall"

	tea "github.com/charmbracelet/bubbletea"

	"github.com/kubiks-inc/kubiks-cli/pkg/types"
)

// ServerCommand handles server commands (MCP, OTEL, etc.)
type ServerCommand struct {
	port string
}

// NewServerCommand creates a new server command
func NewServerCommand() *ServerCommand {
	return &ServerCommand{
		port: "7432",
	}
}

// startMCPServer starts the HTTP server with hello world endpoint
func (c *ServerCommand) startMCPServer() *exec.Cmd {
	// Create a temporary Go file with the server code
	serverCode := `package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello World from Kubiks Server!\n")
	fmt.Fprintf(w, "Method: %s\n", r.Method)
	fmt.Fprintf(w, "URL: %s\n", r.URL.Path)
	fmt.Fprintf(w, "Server running on port ` + c.port + `\n")
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "OK")
}

func otelLogsHandler(w http.ResponseWriter, r *http.Request) {
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
	if len(body) > 0 {
		fmt.Printf("Payload:\n%s\n", string(body))
	}
	fmt.Println("----------------------------------------")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "{\"partialSuccess\":{}}")
}

func otelMetricsHandler(w http.ResponseWriter, r *http.Request) {
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
	if len(body) > 0 {
		fmt.Printf("Payload:\n%s\n", string(body))
	}
	fmt.Println("----------------------------------------")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "{\"partialSuccess\":{}}")
}

func otelTracesHandler(w http.ResponseWriter, r *http.Request) {
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
	if len(body) > 0 {
		fmt.Printf("Payload:\n%s\n", string(body))
	}
	fmt.Println("----------------------------------------")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "{\"partialSuccess\":{}}")
}

func main() {
	http.HandleFunc("/", helloHandler)
	http.HandleFunc("/health", healthHandler)
	
	// OTEL endpoints
	http.HandleFunc("/v1/logs", otelLogsHandler)
	http.HandleFunc("/v1/metrics", otelMetricsHandler)
	http.HandleFunc("/v1/traces", otelTracesHandler)
	
	fmt.Printf("🚀 Kubiks Server starting on port ` + c.port + `...\n")
	fmt.Printf("📍 Endpoints:\n")
	fmt.Printf("   • http://localhost:` + c.port + `/ (Hello World)\n")
	fmt.Printf("   • http://localhost:` + c.port + `/health (Health Check)\n")
	fmt.Printf("   • http://localhost:` + c.port + `/v1/logs (OTEL Logs)\n")
	fmt.Printf("   • http://localhost:` + c.port + `/v1/metrics (OTEL Metrics)\n")
	fmt.Printf("   • http://localhost:` + c.port + `/v1/traces (OTEL Traces)\n")
	fmt.Printf("💡 Press Ctrl+C to stop the server\n\n")
	
	log.Fatal(http.ListenAndServe(":` + c.port + `", nil))
}`

	// Write the server code to a temporary file
	tmpFile := "/tmp/kubiks_mcp_server.go"
	if err := os.WriteFile(tmpFile, []byte(serverCode), 0644); err != nil {
		return nil
	}

	// Create command to run the Go server
	cmd := exec.Command("go", "run", tmpFile)
	
	// Inherit all environment variables from parent process
	cmd.Env = os.Environ()
	
	// Set working directory to current directory
	cmd.Dir, _ = os.Getwd()
	
	// Set process group for proper signal handling
	cmd.SysProcAttr = &syscall.SysProcAttr{
		Setpgid: true,
		Pgid:    0,
	}

	return cmd
}

// Execute runs the MCP server
func (c *ServerCommand) Execute() tea.Cmd {
	return func() tea.Msg {
		cmd := c.startMCPServer()
		if cmd == nil {
			return types.CommandExecutedMsg{
				Output: "",
				Err:    fmt.Errorf("failed to create MCP server command"),
			}
		}

		// Return the command to be executed with suspended UI
		return types.ExecMsg{Cmd: cmd}
	}
}

// GetCommand returns the command definition for the UI
func (c *ServerCommand) GetCommand() types.Command {
	return types.Command{
		Name:        "run server",
		Description: "Start server with OTEL endpoints (logs, metrics, traces)",
		Action:      c.Execute,
	}
}