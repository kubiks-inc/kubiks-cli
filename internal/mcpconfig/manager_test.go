package mcpconfig

import (
	"os"
	"path/filepath"
	"strings"
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

// Additional coverage: load/save error and corrupted file paths
func TestManager_loadConfig_ReadError(t *testing.T) {
	// Create manager with configPath pointing to a directory (ReadFile will fail)
	tempDir := t.TempDir()
	mgr := &Manager{configPath: filepath.Join(tempDir, "mcp.json")}
	// Create a directory at the file path
	if err := os.MkdirAll(mgr.configPath, 0755); err != nil {
		t.Fatalf("failed to create dir at configPath: %v", err)
	}
	if _, err := mgr.loadConfig(); err == nil {
		t.Fatalf("expected read error when configPath is a directory")
	}
}

func TestManager_loadConfig_EmptyFile(t *testing.T) {
	mgr, cleanup := setupTestManager(t)
	defer cleanup()
	// ensure dir exists
	_ = os.MkdirAll(filepath.Dir(mgr.configPath), 0755)
	// write empty file
	if err := os.WriteFile(mgr.configPath, []byte(""), 0644); err != nil {
		t.Fatalf("failed to write empty file: %v", err)
	}
	cfg, err := mgr.loadConfig()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(cfg) != 0 {
		t.Fatalf("expected empty config, got %v", cfg)
	}
}

func TestManager_loadConfig_CorruptedJSON_Backup(t *testing.T) {
	mgr, cleanup := setupTestManager(t)
	defer cleanup()
	_ = os.MkdirAll(filepath.Dir(mgr.configPath), 0755)
	if err := os.WriteFile(mgr.configPath, []byte("{not-json"), 0644); err != nil {
		t.Fatalf("failed to write corrupted file: %v", err)
	}
	cfg, err := mgr.loadConfig()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(cfg) != 0 {
		t.Fatalf("expected empty config on corrupted file, got %v", cfg)
	}
	// backup should exist next to configPath with .backup.
	dir := filepath.Dir(mgr.configPath)
	entries, _ := os.ReadDir(dir)
	found := false
	for _, e := range entries {
		name := e.Name()
		if strings.HasPrefix(name, "mcp.json.backup.") {
			found = true
			break
		}
	}
	if !found {
		t.Fatalf("expected backup file to be created for corrupted JSON")
	}
}

func TestManager_saveConfig_CreateDirError(t *testing.T) {
	// Create a file where the directory should be to force MkdirAll error
	tempDir := t.TempDir()
	badDir := filepath.Join(tempDir, ".cursor")
	if err := os.WriteFile(badDir, []byte("block"), 0644); err != nil {
		t.Fatalf("failed to create blocking file: %v", err)
	}
	mgr := &Manager{configPath: filepath.Join(badDir, "mcp.json")}
	err := mgr.saveConfig(map[string]interface{}{"k": "v"})
	if err == nil || !strings.Contains(err.Error(), "failed to create config directory") {
		t.Fatalf("expected create dir error, got %v", err)
	}
}
