package mcpconfig

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const (
	KubiksServerName = "kubiks"
	KubiksServerURL  = "http://localhost:7433/mcp/sse"
)

// Manager handles MCP configuration file operations
type Manager struct {
	configPath string
}

// NewManager creates a new MCP configuration manager
func NewManager() *Manager {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		// Fallback to current directory if home directory can't be determined
		return &Manager{configPath: "./.cursor/mcp.json"}
	}

	return &Manager{
		configPath: filepath.Join(homeDir, ".cursor", "mcp.json"),
	}
}

// AddKubiksServer adds the kubiks server to the MCP configuration
func (m *Manager) AddKubiksServer() error {
	config, err := m.loadConfig()
	if err != nil {
		return fmt.Errorf("failed to load MCP config: %w", err)
	}

	// Get or create mcpServers
	mcpServers, exists := config["mcpServers"]
	if !exists {
		mcpServers = make(map[string]interface{})
		config["mcpServers"] = mcpServers
	}

	// Ensure it's a map
	serversMap, ok := mcpServers.(map[string]interface{})
	if !ok {
		serversMap = make(map[string]interface{})
		config["mcpServers"] = serversMap
	}

	// Add or update the kubiks server
	serversMap[KubiksServerName] = map[string]interface{}{
		"url": KubiksServerURL,
	}

	return m.saveConfig(config)
}

// RemoveKubiksServer removes the kubiks server from the MCP configuration
func (m *Manager) RemoveKubiksServer() error {
	config, err := m.loadConfig()
	if err != nil {
		// If config doesn't exist or can't be loaded, consider it already cleaned up
		return nil
	}

	// Remove the kubiks server if it exists
	if mcpServers, exists := config["mcpServers"]; exists {
		if serversMap, ok := mcpServers.(map[string]interface{}); ok {
			delete(serversMap, KubiksServerName)
		}
	}

	return m.saveConfig(config)
}

// loadConfig loads the MCP configuration from file
func (m *Manager) loadConfig() (map[string]interface{}, error) {
	// Create directory if it doesn't exist
	dir := filepath.Dir(m.configPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create config directory: %w", err)
	}

	// If file doesn't exist, return empty config
	if _, err := os.Stat(m.configPath); os.IsNotExist(err) {
		return make(map[string]interface{}), nil
	}

	// Read and parse the file
	data, err := os.ReadFile(m.configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	// If the file is empty, return empty config
	if len(data) == 0 || len(strings.TrimSpace(string(data))) == 0 {
		return make(map[string]interface{}), nil
	}

	var config map[string]interface{}
	if err := json.Unmarshal(data, &config); err != nil {
		// If unmarshal fails, exit the whole app
		fmt.Fprintf(os.Stderr, "Fatal error: failed to parse MCP config file: %v\n", err)
		os.Exit(1)
	}

	// Initialize config if it's nil
	if config == nil {
		config = make(map[string]interface{})
	}

	return config, nil
}

// saveConfig saves the MCP configuration to file
func (m *Manager) saveConfig(config map[string]interface{}) error {
	// Create directory if it doesn't exist
	dir := filepath.Dir(m.configPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	// Marshal with proper indentation
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	// Write to file
	if err := os.WriteFile(m.configPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write config file: %w", err)
	}

	return nil
}
