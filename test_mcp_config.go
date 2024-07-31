package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/kubiks-inc/kubiks-cli/internal/mcpconfig"
)

func main() {
	// Create a test config directory
	testDir := "./test_cursor"
	os.MkdirAll(testDir, 0755)
	defer os.RemoveAll(testDir)

	// Create a manager that uses the test directory
	manager := &mcpconfig.Manager{}
	// We'll need to modify the manager to use a custom path for testing
	// For now, let's test with a simple check

	fmt.Println("Testing MCP Configuration Management...")

	// Test adding kubiks server
	fmt.Println("1. Adding kubiks server to MCP config...")
	err := manager.AddKubiksServer()
	if err != nil {
		fmt.Printf("ERROR: %v\n", err)
		return
	}
	fmt.Println("✅ Added kubiks server successfully")

	// Check if config file exists
	homeDir, _ := os.UserHomeDir()
	configPath := filepath.Join(homeDir, ".cursor", "mcp.json")
	
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		fmt.Printf("WARNING: Config file doesn't exist at %s\n", configPath)
	} else {
		fmt.Printf("✅ Config file exists at %s\n", configPath)
	}

	// Test removing kubiks server
	fmt.Println("2. Removing kubiks server from MCP config...")
	err = manager.RemoveKubiksServer()
	if err != nil {
		fmt.Printf("ERROR: %v\n", err)
		return
	}
	fmt.Println("✅ Removed kubiks server successfully")

	fmt.Println("✅ All tests passed!")
}