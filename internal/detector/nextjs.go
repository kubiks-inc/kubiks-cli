package detector

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/kubiks-inc/kubiks-cli/pkg/types"
)

// NextJSDetector detects Next.js applications
type NextJSDetector struct{}

// PackageJSON represents the structure of package.json
type PackageJSON struct {
	Dependencies    map[string]string `json:"dependencies"`
	DevDependencies map[string]string `json:"devDependencies"`
	Scripts         map[string]string `json:"scripts"`
}

// NewNextJSDetector creates a new Next.js detector
func NewNextJSDetector() types.ProjectDetector {
	return &NextJSDetector{}
}

// IsSupported checks if the current directory contains a Next.js application
func (d *NextJSDetector) IsSupported() (bool, error) {
	packageJSON, err := os.ReadFile("package.json")
	if err != nil {
		return false, fmt.Errorf("package.json not found")
	}

	var pkg PackageJSON
	if err := json.Unmarshal(packageJSON, &pkg); err != nil {
		return false, fmt.Errorf("invalid package.json")
	}

	// Check for Next.js in dependencies or devDependencies
	if pkg.Dependencies != nil {
		if _, exists := pkg.Dependencies["next"]; exists {
			return true, nil
		}
	}

	if pkg.DevDependencies != nil {
		if _, exists := pkg.DevDependencies["next"]; exists {
			return true, nil
		}
	}

	return false, fmt.Errorf("Next.js not found in dependencies")
}

// GetProjectType returns the project type name
func (d *NextJSDetector) GetProjectType() string {
	return "Next.js"
}
