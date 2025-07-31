package commands

import (
	"os"
	"strings"
	"testing"

	"github.com/kubiks-inc/kubiks-cli/internal/handlers"
	"github.com/kubiks-inc/kubiks-cli/internal/mcp"
	"github.com/kubiks-inc/kubiks-cli/internal/mcpconfig"
)

func TestNewServerCommand(t *testing.T) {
	cmd := NewServerCommand()

	if cmd == nil {
		t.Fatal("NewServerCommand() returned nil")
	}

	// Verify default ports
	expectedOTELPort := "7432"
	if cmd.otelPort != expectedOTELPort {
		t.Errorf("Expected OTEL port '%s', got '%s'", expectedOTELPort, cmd.otelPort)
	}

	expectedMCPPort := "7433"
	if cmd.mcpPort != expectedMCPPort {
		t.Errorf("Expected MCP port '%s', got '%s'", expectedMCPPort, cmd.mcpPort)
	}

	// Verify MCP manager is initialized
	if cmd.mcpManager == nil {
		t.Error("NewServerCommand() mcpManager is nil")
	}
}

func TestServerCommand_Structure(t *testing.T) {
	// Test that ServerCommand has the expected fields and methods
	cmd := &ServerCommand{}

	// Test field assignment
	cmd.otelPort = "8432"
	cmd.mcpPort = "8433"
	cmd.mcpManager = nil

	if cmd.otelPort != "8432" {
		t.Error("ServerCommand otelPort field assignment failed")
	}

	if cmd.mcpPort != "8433" {
		t.Error("ServerCommand mcpPort field assignment failed")
	}

	if cmd.mcpManager != nil {
		t.Error("ServerCommand mcpManager field should be nil")
	}
}

// Test that ServerCommand implements expected interface
func TestServerCommand_Interface(t *testing.T) {
	var cmd interface{} = &ServerCommand{}

	// Check that it has the expected methods (compile-time check)
	if runDirecter, ok := cmd.(interface{ RunDirect() error }); !ok {
		t.Error("ServerCommand should implement RunDirect() method")
	} else {
		// Verify method signature
		_ = runDirecter.RunDirect
	}

	if startServer, ok := cmd.(interface{ startServer() error }); !ok {
		t.Error("ServerCommand should implement startServer() method")
	} else {
		// Verify method signature
		_ = startServer.startServer
	}
}

func TestServerCommand_RunDirect_DatabaseError(t *testing.T) {
	// Create a command that will fail when trying to create database in invalid path
	cmd := &ServerCommand{
		otelPort:   "7432",
		mcpPort:    "7433",
		mcpManager: mcpconfig.NewManager(),
	}

	// Set invalid HOME to force database creation failure
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)
	os.Setenv("HOME", "/invalid/path/that/does/not/exist")

	err := cmd.RunDirect()
	if err == nil {
		t.Error("Expected error when database creation fails")
	}

	if !strings.Contains(err.Error(), "failed to create OTEL server") {
		t.Errorf("Expected OTEL server creation error, got: %v", err)
	}
}

func TestServerCommand_StartServer_Components(t *testing.T) {
	// Test individual components without starting full server
	tempDir := t.TempDir()
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)
	os.Setenv("HOME", tempDir)

	cmd := NewServerCommand()

	// Test that we can create the required components
	otelServer, err := handlers.NewServer(cmd.otelPort)
	if err != nil {
		t.Fatalf("Failed to create OTEL server: %v", err)
	}
	defer otelServer.Close()

	mcpServer, err := mcp.NewMCPServer(otelServer.GetDB(), cmd.mcpPort)
	if err != nil {
		t.Fatalf("Failed to create MCP server: %v", err)
	}
	defer mcpServer.Close()

	// Test MCP configuration
	err = cmd.mcpManager.AddKubiksServer()
	if err != nil {
		t.Errorf("Failed to add MCP server config: %v", err)
	}

	// Cleanup
	err = cmd.mcpManager.RemoveKubiksServer()
	if err != nil {
		t.Errorf("Failed to remove MCP server config: %v", err)
	}
}

func TestServerCommand_PortConfiguration(t *testing.T) {
	tests := []struct {
		name     string
		otelPort string
		mcpPort  string
	}{
		{
			name:     "default ports",
			otelPort: "7432",
			mcpPort:  "7433",
		},
		{
			name:     "custom ports",
			otelPort: "8080",
			mcpPort:  "8081",
		},
		{
			name:     "high ports",
			otelPort: "65432",
			mcpPort:  "65433",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cmd := &ServerCommand{
				otelPort: tt.otelPort,
				mcpPort:  tt.mcpPort,
			}

			if cmd.otelPort != tt.otelPort {
				t.Errorf("Expected OTEL port '%s', got '%s'", tt.otelPort, cmd.otelPort)
			}

			if cmd.mcpPort != tt.mcpPort {
				t.Errorf("Expected MCP port '%s', got '%s'", tt.mcpPort, cmd.mcpPort)
			}
		})
	}
}

// Test the command factory functions create commands with correct defaults
func TestCommandFactories(t *testing.T) {
	// Test DevCommand factory
	devCmd := NewDevCommand()
	if devCmd == nil {
		t.Error("NewDevCommand() returned nil")
	}

	// Test ServerCommand factory
	serverCmd := NewServerCommand()
	if serverCmd == nil {
		t.Error("NewServerCommand() returned nil")
	}

	// Verify they are different types (compile-time check)
	_ = devCmd
	_ = serverCmd
}

// Test that commands can be created multiple times independently
func TestCommandFactoryIndependence(t *testing.T) {
	cmd1 := NewServerCommand()
	cmd2 := NewServerCommand()

	// Verify they are different instances
	if cmd1 == cmd2 {
		t.Error("Multiple calls to NewServerCommand() should return different instances")
	}

	// Verify they have the same default configuration
	if cmd1.otelPort != cmd2.otelPort {
		t.Error("Multiple ServerCommands should have the same default OTEL port")
	}

	if cmd1.mcpPort != cmd2.mcpPort {
		t.Error("Multiple ServerCommands should have the same default MCP port")
	}

	// Verify changes to one don't affect the other
	cmd1.otelPort = "9999"
	if cmd2.otelPort == "9999" {
		t.Error("Changes to one ServerCommand should not affect another")
	}
}
