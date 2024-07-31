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
		port: "8080",
	}
}

// startMCPServer starts the HTTP server with hello world endpoint
func (c *ServerCommand) startMCPServer() *exec.Cmd {
	// Create a temporary Go file with the server code
	serverCode := `package main

import (
	"fmt"
	"log"
	"net/http"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello World from Kubiks MCP Server!\n")
	fmt.Fprintf(w, "Method: %s\n", r.Method)
	fmt.Fprintf(w, "URL: %s\n", r.URL.Path)
	fmt.Fprintf(w, "Server running on port ` + c.port + `\n")
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "OK")
}

func main() {
	http.HandleFunc("/", helloHandler)
	http.HandleFunc("/health", healthHandler)
	
	fmt.Printf("🚀 Kubiks MCP Server starting on port ` + c.port + `...\n")
	fmt.Printf("📍 Endpoints:\n")
	fmt.Printf("   • http://localhost:` + c.port + `/\n")
	fmt.Printf("   • http://localhost:` + c.port + `/health\n")
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
		Description: "Start MCP server for AI assistant integrations",
		Action:      c.Execute,
	}
}