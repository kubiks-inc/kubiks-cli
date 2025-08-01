package types

import (
	"os"
	"path/filepath"
)

// ProjectDetector interface for detecting project types
type ProjectDetector interface {
	IsSupported() (bool, error)
	GetProjectType() string
}

// GetAppDataDir returns the appropriate directory for storing application data
// For macOS, this follows Apple's guidelines and Homebrew best practices
func GetAppDataDir() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		// Fallback to current directory if home directory can't be determined
		return "./kubiks-data"
	}

	// Use macOS Application Support directory
	return filepath.Join(homeDir, "Library", "Application Support", "kubiks")
}

// GetDatabasePath returns the full path for the SQLite database
func GetDatabasePath() string {
	return filepath.Join(GetAppDataDir(), "kubiks_data.db")
}
