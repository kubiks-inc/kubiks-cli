package types

import (
	"os"
	"path/filepath"
	"runtime"
	"testing"
)

func TestGetAppDataDir(t *testing.T) {
	tests := []struct {
		name        string
		homeDir     string
		expectError bool
		expected    string
	}{
		{
			name:     "valid home directory",
			homeDir:  "/Users/testuser",
			expected: "/Users/testuser/Library/Application Support/kubiks",
		},
		{
			name:     "empty home directory falls back to current directory",
			homeDir:  "",
			expected: "./kubiks-data",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Save original HOME env
			originalHome := os.Getenv("HOME")
			defer os.Setenv("HOME", originalHome)

			// Set test home directory
			if tt.homeDir == "" {
				// Temporarily unset HOME to simulate error condition
				os.Unsetenv("HOME")
			} else {
				os.Setenv("HOME", tt.homeDir)
			}

			result := GetAppDataDir()

			if result != tt.expected {
				t.Errorf("GetAppDataDir() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestGetDatabasePath(t *testing.T) {
	// Save original HOME env
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)

	testHome := "/Users/testuser"
	os.Setenv("HOME", testHome)

	result := GetDatabasePath()
	expected := filepath.Join(testHome, "Library", "Application Support", "kubiks", "kubiks_data.db")

	if result != expected {
		t.Errorf("GetDatabasePath() = %v, want %v", result, expected)
	}
}

func TestGetDatabasePathWithFallback(t *testing.T) {
	// Save original HOME env
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)

	// Unset HOME to test fallback
	os.Unsetenv("HOME")

	result := GetDatabasePath()
	expected := filepath.Join("./kubiks-data", "kubiks_data.db")

	if result != expected {
		t.Errorf("GetDatabasePath() with fallback = %v, want %v", result, expected)
	}
}

func TestProjectDetectorInterface(t *testing.T) {
	// Test that the interface is properly defined
	var detector ProjectDetector
	if detector != nil {
		t.Error("ProjectDetector interface should be nil when not initialized")
	}

	// This is a compile-time test to ensure the interface methods are properly defined
	// If this compiles, the interface is correctly structured
}

func TestMCPConfigStruct(t *testing.T) {
	config := MCPConfig{
		MCPServers: map[string]MCPServerConfig{
			"test-server": {
				URL: "http://localhost:8080",
			},
		},
	}

	if config.MCPServers == nil {
		t.Error("MCPConfig.MCPServers should not be nil")
	}

	if len(config.MCPServers) != 1 {
		t.Errorf("Expected 1 server, got %d", len(config.MCPServers))
	}

	testServer, exists := config.MCPServers["test-server"]
	if !exists {
		t.Error("test-server should exist in MCPServers")
	}

	if testServer.URL != "http://localhost:8080" {
		t.Errorf("Expected URL 'http://localhost:8080', got '%s'", testServer.URL)
	}
}

func TestMCPServerConfigStruct(t *testing.T) {
	config := MCPServerConfig{
		URL: "https://example.com/mcp",
	}

	if config.URL != "https://example.com/mcp" {
		t.Errorf("Expected URL 'https://example.com/mcp', got '%s'", config.URL)
	}
}

// Test platform-specific behavior for GetAppDataDir
func TestGetAppDataDirPlatformSpecific(t *testing.T) {
	// Save original HOME env
	originalHome := os.Getenv("HOME")
	defer os.Setenv("HOME", originalHome)

	testHome := "/Users/testuser"
	os.Setenv("HOME", testHome)

	result := GetAppDataDir()

	// On macOS, it should use Library/Application Support
	if runtime.GOOS == "darwin" {
		expected := filepath.Join(testHome, "Library", "Application Support", "kubiks")
		if result != expected {
			t.Errorf("On macOS, GetAppDataDir() = %v, want %v", result, expected)
		}
	}

	// Verify the path is absolute when home directory is available
	if !filepath.IsAbs(result) && testHome != "" {
		t.Errorf("GetAppDataDir() should return an absolute path when home directory is available, got %v", result)
	}
}
