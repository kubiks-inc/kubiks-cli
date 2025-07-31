package detector

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestNewNextJSDetector(t *testing.T) {
	detector := NewNextJSDetector()
	if detector == nil {
		t.Error("NewNextJSDetector() should not return nil")
	}

	// Test interface implementation
	_, ok := detector.(*NextJSDetector)
	if !ok {
		t.Error("NewNextJSDetector() should return a *NextJSDetector")
	}
}

func TestNextJSDetector_GetProjectType(t *testing.T) {
	detector := &NextJSDetector{}
	projectType := detector.GetProjectType()
	expected := "Next.js"

	if projectType != expected {
		t.Errorf("GetProjectType() = %v, want %v", projectType, expected)
	}
}

func TestNextJSDetector_IsSupported(t *testing.T) {
	tests := []struct {
		name           string
		packageJSON    map[string]interface{}
		expectedResult bool
		expectedError  string
	}{
		{
			name: "Next.js in dependencies",
			packageJSON: map[string]interface{}{
				"name": "test-app",
				"dependencies": map[string]interface{}{
					"next":  "13.0.0",
					"react": "18.0.0",
				},
			},
			expectedResult: true,
			expectedError:  "",
		},
		{
			name: "Next.js in devDependencies",
			packageJSON: map[string]interface{}{
				"name": "test-app",
				"devDependencies": map[string]interface{}{
					"next": "^13.0.0",
				},
			},
			expectedResult: true,
			expectedError:  "",
		},
		{
			name: "Next.js in both dependencies and devDependencies",
			packageJSON: map[string]interface{}{
				"name": "test-app",
				"dependencies": map[string]interface{}{
					"react": "18.0.0",
				},
				"devDependencies": map[string]interface{}{
					"next": "^13.0.0",
				},
			},
			expectedResult: true,
			expectedError:  "",
		},
		{
			name: "No Next.js dependency",
			packageJSON: map[string]interface{}{
				"name": "test-app",
				"dependencies": map[string]interface{}{
					"react":   "18.0.0",
					"express": "4.18.0",
				},
			},
			expectedResult: false,
			expectedError:  "Next.js not found in dependencies",
		},
		{
			name: "Empty dependencies",
			packageJSON: map[string]interface{}{
				"name":         "test-app",
				"dependencies": map[string]interface{}{},
			},
			expectedResult: false,
			expectedError:  "Next.js not found in dependencies",
		},
		{
			name: "No dependencies field",
			packageJSON: map[string]interface{}{
				"name": "test-app",
			},
			expectedResult: false,
			expectedError:  "Next.js not found in dependencies",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create a temporary directory for the test
			tempDir, err := os.MkdirTemp("", "nextjs-detector-test")
			if err != nil {
				t.Fatalf("Failed to create temp dir: %v", err)
			}
			defer os.RemoveAll(tempDir)

			// Change to the temp directory
			originalDir, err := os.Getwd()
			if err != nil {
				t.Fatalf("Failed to get current directory: %v", err)
			}
			defer os.Chdir(originalDir)

			if err := os.Chdir(tempDir); err != nil {
				t.Fatalf("Failed to change to temp directory: %v", err)
			}

			// Create package.json file
			packageJSONPath := filepath.Join(tempDir, "package.json")
			jsonData, err := json.MarshalIndent(tt.packageJSON, "", "  ")
			if err != nil {
				t.Fatalf("Failed to marshal package.json: %v", err)
			}

			if err := os.WriteFile(packageJSONPath, jsonData, 0644); err != nil {
				t.Fatalf("Failed to write package.json: %v", err)
			}

			// Test the detector
			detector := &NextJSDetector{}
			result, err := detector.IsSupported()

			// Check the result
			if result != tt.expectedResult {
				t.Errorf("IsSupported() result = %v, want %v", result, tt.expectedResult)
			}

			// Check the error
			if tt.expectedError == "" {
				if err != nil {
					t.Errorf("IsSupported() error = %v, want nil", err)
				}
			} else {
				if err == nil {
					t.Errorf("IsSupported() error = nil, want %v", tt.expectedError)
				} else if err.Error() != tt.expectedError {
					t.Errorf("IsSupported() error = %v, want %v", err.Error(), tt.expectedError)
				}
			}
		})
	}
}

func TestNextJSDetector_IsSupported_NoPackageJSON(t *testing.T) {
	// Create a temporary directory without package.json
	tempDir, err := os.MkdirTemp("", "nextjs-detector-test-no-package")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	// Change to the temp directory
	originalDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("Failed to get current directory: %v", err)
	}
	defer os.Chdir(originalDir)

	if err := os.Chdir(tempDir); err != nil {
		t.Fatalf("Failed to change to temp directory: %v", err)
	}

	detector := &NextJSDetector{}
	result, err := detector.IsSupported()

	if result != false {
		t.Errorf("IsSupported() result = %v, want false", result)
	}

	if err == nil {
		t.Error("IsSupported() error = nil, want error about missing package.json")
	} else if err.Error() != "package.json not found" {
		t.Errorf("IsSupported() error = %v, want 'package.json not found'", err.Error())
	}
}

func TestNextJSDetector_IsSupported_InvalidJSON(t *testing.T) {
	// Create a temporary directory with invalid package.json
	tempDir, err := os.MkdirTemp("", "nextjs-detector-test-invalid-json")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	// Change to the temp directory
	originalDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("Failed to get current directory: %v", err)
	}
	defer os.Chdir(originalDir)

	if err := os.Chdir(tempDir); err != nil {
		t.Fatalf("Failed to change to temp directory: %v", err)
	}

	// Create invalid package.json
	packageJSONPath := filepath.Join(tempDir, "package.json")
	invalidJSON := `{"name": "test", "dependencies": {` // Invalid JSON - missing closing braces
	if err := os.WriteFile(packageJSONPath, []byte(invalidJSON), 0644); err != nil {
		t.Fatalf("Failed to write invalid package.json: %v", err)
	}

	detector := &NextJSDetector{}
	result, err := detector.IsSupported()

	if result != false {
		t.Errorf("IsSupported() result = %v, want false", result)
	}

	if err == nil {
		t.Error("IsSupported() error = nil, want error about invalid package.json")
	} else if err.Error() != "invalid package.json" {
		t.Errorf("IsSupported() error = %v, want 'invalid package.json'", err.Error())
	}
}

func TestPackageJSONStruct(t *testing.T) {
	// Test the PackageJSON struct marshaling/unmarshaling
	pkg := PackageJSON{
		Dependencies: map[string]string{
			"next":  "13.0.0",
			"react": "18.0.0",
		},
		DevDependencies: map[string]string{
			"typescript": "4.9.0",
		},
		Scripts: map[string]string{
			"dev":   "next dev",
			"build": "next build",
		},
	}

	// Marshal to JSON
	jsonData, err := json.Marshal(pkg)
	if err != nil {
		t.Fatalf("Failed to marshal PackageJSON: %v", err)
	}

	// Unmarshal back
	var unmarshaled PackageJSON
	if err := json.Unmarshal(jsonData, &unmarshaled); err != nil {
		t.Fatalf("Failed to unmarshal PackageJSON: %v", err)
	}

	// Verify the data
	if len(unmarshaled.Dependencies) != 2 {
		t.Errorf("Expected 2 dependencies, got %d", len(unmarshaled.Dependencies))
	}

	if unmarshaled.Dependencies["next"] != "13.0.0" {
		t.Errorf("Expected next version '13.0.0', got '%s'", unmarshaled.Dependencies["next"])
	}

	if len(unmarshaled.DevDependencies) != 1 {
		t.Errorf("Expected 1 devDependency, got %d", len(unmarshaled.DevDependencies))
	}

	if len(unmarshaled.Scripts) != 2 {
		t.Errorf("Expected 2 scripts, got %d", len(unmarshaled.Scripts))
	}
}
