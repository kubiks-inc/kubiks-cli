package instrumentation

import (
	_ "embed"
	"fmt"
	"os"
	"path/filepath"
)

//go:embed ../../instrumentation/dist/instrumentation.bundled.js
var instrumentationJS []byte

// GetInstrumentationPath writes the embedded instrumentation.js to a temporary file
// and returns the path to that file
func GetInstrumentationPath() (string, error) {
	// Create a temporary file for the instrumentation
	tmpDir := os.TempDir()
	tmpFile := filepath.Join(tmpDir, "kubiks-instrumentation.js")
	
	// Write the embedded content to the temporary file
	if err := os.WriteFile(tmpFile, instrumentationJS, 0644); err != nil {
		return "", fmt.Errorf("failed to write instrumentation file: %w", err)
	}
	
	return tmpFile, nil
}

// IsEmbedded returns true if the instrumentation is embedded in the binary
func IsEmbedded() bool {
	return len(instrumentationJS) > 0
}