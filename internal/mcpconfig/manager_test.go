package mcpconfig

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/kubiks-inc/kubiks-cli/pkg/types"
)

func TestNewManager(t *testing.T) {
	// Test with valid home directory
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)

	testHome := "/tmp/test-home"
	os.Setenv("HOME", testHome)

	manager := NewManager()
	expectedPath := filepath.Join(testHome, ".cursor", "mcp.json")

	if manager.configPath != expectedPath {
		t.Errorf("NewManager() configPath = %v, want %v", manager.configPath, expectedPath)
	}
}

func TestNewManager_FallbackPath(t *testing.T) {
	// Test fallback when home directory can't be determined
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)

	os.Unsetenv("HOME")

	manager := NewManager()
	expectedPath := "./.cursor/mcp.json"

	if manager.configPath != expectedPath {
		t.Errorf("NewManager() fallback configPath = %v, want %v", manager.configPath, expectedPath)
	}
}

func setupTestManager(t *testing.T) (*Manager, func()) {
	tempDir, err := os.MkdirTemp("", "mcp-config-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}

	configPath := filepath.Join(tempDir, ".cursor", "mcp.json")
	manager := &Manager{configPath: configPath}

	cleanup := func() {
		os.RemoveAll(tempDir)
	}

	return manager, cleanup
}

func TestManager_AddKubiksServer(t *testing.T) {
	manager, cleanup := setupTestManager(t)
	defer cleanup()

	// Test adding kubiks server to empty config
	err := manager.AddKubiksServer()
	if err != nil {
		t.Errorf("AddKubiksServer() error = %v", err)
	}

	// Verify the config file was created and contains the kubiks server
	config, err := manager.loadConfig()
	if err != nil {
		t.Fatalf("Failed to load config after adding server: %v", err)
	}

	if config.MCPServers == nil {
		t.Fatal("MCPServers map is nil")
	}

	kubiksServer, exists := config.MCPServers[KubiksServerName]
	if !exists {
		t.Error("Kubiks server not found in config")
	}

	if kubiksServer.URL != KubiksServerURL {
		t.Errorf("Kubiks server URL = %v, want %v", kubiksServer.URL, KubiksServerURL)
	}
}

func TestManager_AddKubiksServer_ExistingConfig(t *testing.T) {
	manager, cleanup := setupTestManager(t)
	defer cleanup()

	// Create an existing config with another server
	existingConfig := &types.MCPConfig{
		MCPServers: map[string]types.MCPServerConfig{
			"existing-server": {
				URL: "http://localhost:9999",
			},
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

	// Verify both servers exist
	config, err := manager.loadConfig()
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	if len(config.MCPServers) != 2 {
		t.Errorf("Expected 2 servers, got %d", len(config.MCPServers))
	}

	// Verify existing server is still there
	existingServer, exists := config.MCPServers["existing-server"]
	if !exists {
		t.Error("Existing server was removed")
	}
	if existingServer.URL != "http://localhost:9999" {
		t.Errorf("Existing server URL changed: %v", existingServer.URL)
	}

	// Verify kubiks server was added
	kubiksServer, exists := config.MCPServers[KubiksServerName]
	if !exists {
		t.Error("Kubiks server not found")
	}
	if kubiksServer.URL != KubiksServerURL {
		t.Errorf("Kubiks server URL = %v, want %v", kubiksServer.URL, KubiksServerURL)
	}
}

func TestManager_RemoveKubiksServer(t *testing.T) {
	manager, cleanup := setupTestManager(t)
	defer cleanup()

	// First add the kubiks server
	err := manager.AddKubiksServer()
	if err != nil {
		t.Fatalf("Failed to add kubiks server: %v", err)
	}

	// Add another server
	config, err := manager.loadConfig()
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	config.MCPServers["other-server"] = types.MCPServerConfig{
		URL: "http://localhost:8888",
	}

	err = manager.saveConfig(config)
	if err != nil {
		t.Fatalf("Failed to save config with other server: %v", err)
	}

	// Now remove kubiks server
	err = manager.RemoveKubiksServer()
	if err != nil {
		t.Errorf("RemoveKubiksServer() error = %v", err)
	}

	// Verify kubiks server was removed but other server remains
	config, err = manager.loadConfig()
	if err != nil {
		t.Fatalf("Failed to load config after removal: %v", err)
	}

	if _, exists := config.MCPServers[KubiksServerName]; exists {
		t.Error("Kubiks server was not removed")
	}

	if _, exists := config.MCPServers["other-server"]; !exists {
		t.Error("Other server was incorrectly removed")
	}
}

func TestManager_RemoveKubiksServer_NoConfig(t *testing.T) {
	manager, cleanup := setupTestManager(t)
	defer cleanup()

	// Try to remove kubiks server when no config exists
	err := manager.RemoveKubiksServer()
	if err != nil {
		t.Errorf("RemoveKubiksServer() with no config error = %v, want nil", err)
	}
}

func TestManager_LoadConfig_NewFile(t *testing.T) {
	manager, cleanup := setupTestManager(t)
	defer cleanup()

	// Load config when file doesn't exist
	config, err := manager.loadConfig()
	if err != nil {
		t.Errorf("loadConfig() with no file error = %v", err)
	}

	if config == nil {
		t.Fatal("loadConfig() returned nil config")
	}

	if config.MCPServers == nil {
		t.Error("MCPServers map is nil")
	}

	if len(config.MCPServers) != 0 {
		t.Errorf("Expected empty MCPServers, got %d entries", len(config.MCPServers))
	}
}

func TestManager_LoadConfig_EmptyFile(t *testing.T) {
	manager, cleanup := setupTestManager(t)
	defer cleanup()

	// Create directory
	err := os.MkdirAll(filepath.Dir(manager.configPath), 0755)
	if err != nil {
		t.Fatalf("Failed to create config directory: %v", err)
	}

	// Create empty file
	err = os.WriteFile(manager.configPath, []byte(""), 0644)
	if err != nil {
		t.Fatalf("Failed to create empty config file: %v", err)
	}

	config, err := manager.loadConfig()
	if err != nil {
		t.Errorf("loadConfig() with empty file error = %v", err)
	}

	if config.MCPServers == nil {
		t.Error("MCPServers map is nil")
	}

	if len(config.MCPServers) != 0 {
		t.Errorf("Expected empty MCPServers, got %d entries", len(config.MCPServers))
	}
}

func TestManager_LoadConfig_WhitespaceFile(t *testing.T) {
	manager, cleanup := setupTestManager(t)
	defer cleanup()

	// Create directory
	err := os.MkdirAll(filepath.Dir(manager.configPath), 0755)
	if err != nil {
		t.Fatalf("Failed to create config directory: %v", err)
	}

	// Create file with only whitespace
	err = os.WriteFile(manager.configPath, []byte("   \n\t  \n   "), 0644)
	if err != nil {
		t.Fatalf("Failed to create whitespace config file: %v", err)
	}

	config, err := manager.loadConfig()
	if err != nil {
		t.Errorf("loadConfig() with whitespace file error = %v", err)
	}

	if config.MCPServers == nil {
		t.Error("MCPServers map is nil")
	}
}

func TestManager_LoadConfig_ValidJSON(t *testing.T) {
	manager, cleanup := setupTestManager(t)
	defer cleanup()

	// Create directory
	err := os.MkdirAll(filepath.Dir(manager.configPath), 0755)
	if err != nil {
		t.Fatalf("Failed to create config directory: %v", err)
	}

	// Create valid config file
	testConfig := &types.MCPConfig{
		MCPServers: map[string]types.MCPServerConfig{
			"test-server": {
				URL: "http://test:1234",
			},
		},
	}

	jsonData, err := json.MarshalIndent(testConfig, "", "  ")
	if err != nil {
		t.Fatalf("Failed to marshal test config: %v", err)
	}

	err = os.WriteFile(manager.configPath, jsonData, 0644)
	if err != nil {
		t.Fatalf("Failed to write test config: %v", err)
	}

	// Load the config
	config, err := manager.loadConfig()
	if err != nil {
		t.Errorf("loadConfig() with valid JSON error = %v", err)
	}

	if len(config.MCPServers) != 1 {
		t.Errorf("Expected 1 server, got %d", len(config.MCPServers))
	}

	testServer, exists := config.MCPServers["test-server"]
	if !exists {
		t.Error("test-server not found")
	}

	if testServer.URL != "http://test:1234" {
		t.Errorf("test-server URL = %v, want %v", testServer.URL, "http://test:1234")
	}
}

func TestManager_SaveConfig(t *testing.T) {
	manager, cleanup := setupTestManager(t)
	defer cleanup()

	// Create test config
	testConfig := &types.MCPConfig{
		MCPServers: map[string]types.MCPServerConfig{
			"save-test": {
				URL: "http://save-test:5555",
			},
		},
	}

	// Save the config
	err := manager.saveConfig(testConfig)
	if err != nil {
		t.Errorf("saveConfig() error = %v", err)
	}

	// Verify the file was created
	if _, err := os.Stat(manager.configPath); os.IsNotExist(err) {
		t.Error("Config file was not created")
	}

	// Verify the content
	data, err := os.ReadFile(manager.configPath)
	if err != nil {
		t.Fatalf("Failed to read saved config: %v", err)
	}

	var savedConfig types.MCPConfig
	err = json.Unmarshal(data, &savedConfig)
	if err != nil {
		t.Fatalf("Failed to unmarshal saved config: %v", err)
	}

	if len(savedConfig.MCPServers) != 1 {
		t.Errorf("Expected 1 server in saved config, got %d", len(savedConfig.MCPServers))
	}

	saveTest, exists := savedConfig.MCPServers["save-test"]
	if !exists {
		t.Error("save-test server not found in saved config")
	}

	if saveTest.URL != "http://save-test:5555" {
		t.Errorf("save-test URL = %v, want %v", saveTest.URL, "http://save-test:5555")
	}
}

func TestManager_SaveConfig_CreatesDirectory(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "mcp-config-dir-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	// Create manager with nested path that doesn't exist
	configPath := filepath.Join(tempDir, "nested", "deep", "config.json")
	manager := &Manager{configPath: configPath}

	testConfig := &types.MCPConfig{
		MCPServers: map[string]types.MCPServerConfig{
			"dir-test": {URL: "http://test:6666"},
		},
	}

	// Save should create the directory
	err = manager.saveConfig(testConfig)
	if err != nil {
		t.Errorf("saveConfig() with new directory error = %v", err)
	}

	// Verify directory was created
	if _, err := os.Stat(filepath.Dir(configPath)); os.IsNotExist(err) {
		t.Error("Config directory was not created")
	}

	// Verify file was created
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		t.Error("Config file was not created")
	}
}

func TestConstants(t *testing.T) {
	if KubiksServerName != "kubiks" {
		t.Errorf("KubiksServerName = %v, want %v", KubiksServerName, "kubiks")
	}

	if KubiksServerURL != "http://localhost:7433/mcp/sse" {
		t.Errorf("KubiksServerURL = %v, want %v", KubiksServerURL, "http://localhost:7433/mcp/sse")
	}
}

// Test edge case where config file exists but has nil MCPServers
func TestManager_LoadConfig_NilMCPServers(t *testing.T) {
	manager, cleanup := setupTestManager(t)
	defer cleanup()

	// Create directory
	err := os.MkdirAll(filepath.Dir(manager.configPath), 0755)
	if err != nil {
		t.Fatalf("Failed to create config directory: %v", err)
	}

	// Create config with nil MCPServers (this can happen with incomplete JSON)
	incompleteJSON := `{"mcpServers": null}`
	err = os.WriteFile(manager.configPath, []byte(incompleteJSON), 0644)
	if err != nil {
		t.Fatalf("Failed to write incomplete config: %v", err)
	}

	config, err := manager.loadConfig()
	if err != nil {
		t.Errorf("loadConfig() with nil MCPServers error = %v", err)
	}

	// Should initialize the map
	if config.MCPServers == nil {
		t.Error("MCPServers map should be initialized, got nil")
	}
}