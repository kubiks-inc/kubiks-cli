package mcpconfig

import (
	"os"
	"path/filepath"
	"testing"
)

func setupTestManager(t *testing.T) (*Manager, func()) {
	tempDir, err := os.MkdirTemp("", "mcp_test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}

	manager := &Manager{
		configPath: filepath.Join(tempDir, ".cursor", "mcp.json"),
	}

	cleanup := func() {
		os.RemoveAll(tempDir)
	}

	return manager, cleanup
}

func TestNewManager(t *testing.T) {
	// Mock home directory
	testHome := "/home/test"
	os.Setenv("HOME", testHome)
	defer os.Unsetenv("HOME")

	manager := NewManager()
	expectedPath := filepath.Join(testHome, ".cursor", "mcp.json")

	if manager.configPath != expectedPath {
		t.Errorf("Expected config path %s, got %s", expectedPath, manager.configPath)
	}
}

func TestManager_AddKubiksServer(t *testing.T) {
	manager, cleanup := setupTestManager(t)
	defer cleanup()

	err := manager.AddKubiksServer()
	if err != nil {
		t.Errorf("AddKubiksServer() error = %v", err)
	}

	// Verify the server was added
	config, err := manager.loadConfig()
	if err != nil {
		t.Fatalf("Failed to load config after adding server: %v", err)
	}

	mcpServers, exists := config["mcpServers"]
	if !exists {
		t.Fatal("mcpServers not found in config")
	}

	serversMap, ok := mcpServers.(map[string]interface{})
	if !ok {
		t.Fatal("mcpServers is not a map")
	}

	kubiksServer, exists := serversMap[KubiksServerName]
	if !exists {
		t.Error("Kubiks server not found in config")
	}

	serverMap, ok := kubiksServer.(map[string]interface{})
	if !ok {
		t.Fatal("Kubiks server is not a map")
	}

	url, exists := serverMap["url"]
	if !exists {
		t.Error("URL not found in kubiks server config")
	}

	if url != KubiksServerURL {
		t.Errorf("Kubiks server URL = %v, want %v", url, KubiksServerURL)
	}
}

func TestManager_AddKubiksServer_ExistingConfig(t *testing.T) {
	manager, cleanup := setupTestManager(t)
	defer cleanup()

	// Create an existing config with another server
	existingConfig := map[string]interface{}{
		"mcpServers": map[string]interface{}{
			"existing-server": map[string]interface{}{
				"url": "http://localhost:9999",
			},
		},
		"globalSettings": map[string]interface{}{
			"timeout": 30,
		},
	}

	// Save the existing config
	err := manager.saveConfig(existingConfig)
	if err != nil {
		t.Fatalf("Failed to save existing config: %v", err)
	}

	// Add kubiks server
	err = manager.AddKubiksServer()
	if err != nil {
		t.Errorf("AddKubiksServer() error = %v", err)
	}

	// Verify both servers exist and other fields are preserved
	config, err := manager.loadConfig()
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	mcpServers, exists := config["mcpServers"]
	if !exists {
		t.Fatal("mcpServers not found in config")
	}

	serversMap, ok := mcpServers.(map[string]interface{})
	if !ok {
		t.Fatal("mcpServers is not a map")
	}

	if len(serversMap) != 2 {
		t.Errorf("Expected 2 servers, got %d", len(serversMap))
	}

	// Check existing server
	existingServer, exists := serversMap["existing-server"]
	if !exists {
		t.Error("Existing server not found")
	}
	existingMap, ok := existingServer.(map[string]interface{})
	if !ok {
		t.Fatal("Existing server is not a map")
	}
	if existingMap["url"] != "http://localhost:9999" {
		t.Errorf("Existing server URL = %v, want %v", existingMap["url"], "http://localhost:9999")
	}

	// Check kubiks server
	kubiksServer, exists := serversMap[KubiksServerName]
	if !exists {
		t.Error("Kubiks server not found")
	}
	kubiksMap, ok := kubiksServer.(map[string]interface{})
	if !ok {
		t.Fatal("Kubiks server is not a map")
	}
	if kubiksMap["url"] != KubiksServerURL {
		t.Errorf("Kubiks server URL = %v, want %v", kubiksMap["url"], KubiksServerURL)
	}

	// Check that other fields are preserved
	globalSettings, exists := config["globalSettings"]
	if !exists {
		t.Error("globalSettings not preserved")
	}
	settingsMap, ok := globalSettings.(map[string]interface{})
	if !ok {
		t.Fatal("globalSettings is not a map")
	}
	if settingsMap["timeout"] != float64(30) { // JSON unmarshals numbers as float64
		t.Errorf("globalSettings.timeout = %v, want 30", settingsMap["timeout"])
	}
}

func TestManager_RemoveKubiksServer(t *testing.T) {
	manager, cleanup := setupTestManager(t)
	defer cleanup()

	// First add a server
	existingConfig := map[string]interface{}{
		"mcpServers": map[string]interface{}{
			"other-server": map[string]interface{}{
				"url": "http://localhost:8888",
			},
			KubiksServerName: map[string]interface{}{
				"url": KubiksServerURL,
			},
		},
	}

	err := manager.saveConfig(existingConfig)
	if err != nil {
		t.Fatalf("Failed to save config: %v", err)
	}

	// Remove kubiks server
	err = manager.RemoveKubiksServer()
	if err != nil {
		t.Errorf("RemoveKubiksServer() error = %v", err)
	}

	// Verify kubiks server was removed but other server remains
	config, err := manager.loadConfig()
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	mcpServers, exists := config["mcpServers"]
	if !exists {
		t.Fatal("mcpServers not found in config")
	}

	serversMap, ok := mcpServers.(map[string]interface{})
	if !ok {
		t.Fatal("mcpServers is not a map")
	}

	if _, exists := serversMap[KubiksServerName]; exists {
		t.Error("Kubiks server should have been removed")
	}

	if _, exists := serversMap["other-server"]; !exists {
		t.Error("Other server should still exist")
	}
}

func TestManager_RemoveKubiksServer_NoConfig(t *testing.T) {
	manager, cleanup := setupTestManager(t)
	defer cleanup()

	// Try to remove from non-existent config (should not error)
	err := manager.RemoveKubiksServer()
	if err != nil {
		t.Errorf("RemoveKubiksServer() on non-existent config error = %v", err)
	}
}

func TestConstants(t *testing.T) {
	if KubiksServerName != "kubiks" {
		t.Errorf("KubiksServerName = %v, want 'kubiks'", KubiksServerName)
	}

	if KubiksServerURL != "http://localhost:7433/mcp/sse" {
		t.Errorf("KubiksServerURL = %v, want 'http://localhost:7433/mcp/sse'", KubiksServerURL)
	}
}
