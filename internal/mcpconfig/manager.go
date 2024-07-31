package mcpconfig

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/kubiks-inc/kubiks-cli/pkg/types"
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

	// Initialize mcpServers map if it doesn't exist
	if config.MCPServers == nil {
		config.MCPServers = make(map[string]types.MCPServerConfig)
	}

	// Add or update the kubiks server
	config.MCPServers[KubiksServerName] = types.MCPServerConfig{
		URL: KubiksServerURL,
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
	if config.MCPServers != nil {
		delete(config.MCPServers, KubiksServerName)
	}

	return m.saveConfig(config)
}

// loadConfig loads the MCP configuration from file
func (m *Manager) loadConfig() (*types.MCPConfig, error) {
	// Create directory if it doesn't exist
	dir := filepath.Dir(m.configPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create config directory: %w", err)
	}

	// If file doesn't exist, return empty config
	if _, err := os.Stat(m.configPath); os.IsNotExist(err) {
		return &types.MCPConfig{
			MCPServers: make(map[string]types.MCPServerConfig),
		}, nil
	}

	// Read and parse the file
	data, err := os.ReadFile(m.configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var config types.MCPConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}

	// Initialize map if it's nil
	if config.MCPServers == nil {
		config.MCPServers = make(map[string]types.MCPServerConfig)
	}

	return &config, nil
}

// saveConfig saves the MCP configuration to file
func (m *Manager) saveConfig(config *types.MCPConfig) error {
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