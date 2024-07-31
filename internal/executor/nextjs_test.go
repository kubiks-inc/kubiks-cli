package executor

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestNewNextJSExecutor(t *testing.T) {
	// Create a temporary directory for the test
	tempDir, err := os.MkdirTemp("", "nextjs-executor-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	// Create a fake executable in the temp directory
	execPath := filepath.Join(tempDir, "kubiks")
	if err := os.WriteFile(execPath, []byte("#!/bin/sh\n"), 0755); err != nil {
		t.Fatalf("Failed to create fake executable: %v", err)
	}

	// Create the instrumentation file
	instrumentationPath := filepath.Join(tempDir, "instrumentation.js")
	instrumentationContent := `// Mock instrumentation file
console.log("OpenTelemetry instrumentation loaded");`
	if err := os.WriteFile(instrumentationPath, []byte(instrumentationContent), 0644); err != nil {
		t.Fatalf("Failed to create instrumentation file: %v", err)
	}

	// Note: We can't mock os.Executable directly in Go tests
	// This test verifies the constructor logic but uses a manual setup

	// Since we can't mock os.Executable directly, we'll create an executor manually
	// and test its methods
	executor := &NextJSExecutor{
		instrumentationPath: instrumentationPath,
	}

	// Test that the instrumentation path was set correctly
	if executor.instrumentationPath != instrumentationPath {
		t.Errorf("Expected instrumentation path %s, got %s", instrumentationPath, executor.instrumentationPath)
	}

	// Test ensureInstrumentationFile
	err = executor.ensureInstrumentationFile()
	if err != nil {
		t.Errorf("ensureInstrumentationFile() error = %v", err)
	}
}

func TestNextJSExecutor_EnsureInstrumentationFile_Missing(t *testing.T) {
	executor := &NextJSExecutor{
		instrumentationPath: "/nonexistent/path/instrumentation.js",
	}

	err := executor.ensureInstrumentationFile()
	if err == nil {
		t.Error("ensureInstrumentationFile() should return error for missing file")
	}

	expectedErrorSubstring := "instrumentation file not found"
	if !strings.Contains(err.Error(), expectedErrorSubstring) {
		t.Errorf("Expected error to contain '%s', got: %v", expectedErrorSubstring, err)
	}
}

func TestNextJSExecutor_GetInstrumentationPath(t *testing.T) {
	testPath := "/test/path/instrumentation.js"
	executor := &NextJSExecutor{
		instrumentationPath: testPath,
	}

	result := executor.GetInstrumentationPath()
	if result != testPath {
		t.Errorf("GetInstrumentationPath() = %v, want %v", result, testPath)
	}
}

func setupTestEnvironment(t *testing.T) (string, func()) {
	// Create a temporary directory for the test
	tempDir, err := os.MkdirTemp("", "nextjs-executor-env-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}

	// Save original directory
	originalDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("Failed to get current directory: %v", err)
	}

	// Change to temp directory
	if err := os.Chdir(tempDir); err != nil {
		os.RemoveAll(tempDir)
		t.Fatalf("Failed to change to temp directory: %v", err)
	}

	cleanup := func() {
		os.Chdir(originalDir)
		os.RemoveAll(tempDir)
	}

	return tempDir, cleanup
}

func TestNextJSExecutor_ValidateEnvironment_NoPackageJSON(t *testing.T) {
	tempDir, cleanup := setupTestEnvironment(t)
	defer cleanup()

	// Create instrumentation file
	instrumentationPath := filepath.Join(tempDir, "instrumentation.js")
	if err := os.WriteFile(instrumentationPath, []byte("// test"), 0644); err != nil {
		t.Fatalf("Failed to create instrumentation file: %v", err)
	}

	executor := &NextJSExecutor{
		instrumentationPath: instrumentationPath,
	}

	err := executor.validateEnvironment()
	if err == nil {
		t.Error("validateEnvironment() should return error when package.json is missing")
	}

	expectedError := "package.json not found in current directory"
	if !strings.Contains(err.Error(), expectedError) {
		t.Errorf("Expected error to contain '%s', got: %v", expectedError, err)
	}
}

func TestNextJSExecutor_ValidateEnvironment_NoNodeModules(t *testing.T) {
	tempDir, cleanup := setupTestEnvironment(t)
	defer cleanup()

	// Create package.json
	packageJSON := map[string]interface{}{
		"name": "test-app",
		"dependencies": map[string]interface{}{
			"next": "13.0.0",
		},
	}

	jsonData, _ := json.Marshal(packageJSON)
	if err := os.WriteFile("package.json", jsonData, 0644); err != nil {
		t.Fatalf("Failed to create package.json: %v", err)
	}

	// Create instrumentation file
	instrumentationPath := filepath.Join(tempDir, "instrumentation.js")
	if err := os.WriteFile(instrumentationPath, []byte("// test"), 0644); err != nil {
		t.Fatalf("Failed to create instrumentation file: %v", err)
	}

	executor := &NextJSExecutor{
		instrumentationPath: instrumentationPath,
	}

	err := executor.validateEnvironment()
	if err == nil {
		t.Error("validateEnvironment() should return error when node_modules is missing")
	}

	expectedError := "node_modules not found"
	if !strings.Contains(err.Error(), expectedError) {
		t.Errorf("Expected error to contain '%s', got: %v", expectedError, err)
	}
}

func TestNextJSExecutor_ValidateEnvironment_Success(t *testing.T) {
	tempDir, cleanup := setupTestEnvironment(t)
	defer cleanup()

	// Create package.json
	packageJSON := map[string]interface{}{
		"name": "test-app",
		"dependencies": map[string]interface{}{
			"next": "13.0.0",
		},
	}

	jsonData, _ := json.Marshal(packageJSON)
	if err := os.WriteFile("package.json", jsonData, 0644); err != nil {
		t.Fatalf("Failed to create package.json: %v", err)
	}

	// Create node_modules directory
	if err := os.MkdirAll("node_modules", 0755); err != nil {
		t.Fatalf("Failed to create node_modules: %v", err)
	}

	// Create instrumentation file
	instrumentationPath := filepath.Join(tempDir, "instrumentation.js")
	if err := os.WriteFile(instrumentationPath, []byte("// test"), 0644); err != nil {
		t.Fatalf("Failed to create instrumentation file: %v", err)
	}

	executor := &NextJSExecutor{
		instrumentationPath: instrumentationPath,
	}

	err := executor.validateEnvironment()
	// Note: This will still fail because npm is not available in the test environment
	// but it should get past the package.json and node_modules checks
	if err != nil && !strings.Contains(err.Error(), "npm not found") {
		t.Errorf("validateEnvironment() failed for unexpected reason: %v", err)
	}
}

func TestNextJSExecutor_GetServiceNameFromPackageJSON(t *testing.T) {
	tests := []struct {
		name        string
		packageJSON map[string]interface{}
		expected    string
	}{
		{
			name: "valid package.json with name",
			packageJSON: map[string]interface{}{
				"name":    "my-nextjs-app",
				"version": "1.0.0",
			},
			expected: "my-nextjs-app",
		},
		{
			name: "package.json without name field",
			packageJSON: map[string]interface{}{
				"version": "1.0.0",
			},
			expected: "", // Will fallback to directory name
		},
		{
			name: "package.json with empty name",
			packageJSON: map[string]interface{}{
				"name":    "",
				"version": "1.0.0",
			},
			expected: "", // Will fallback to directory name
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tempDir, cleanup := setupTestEnvironment(t)
			defer cleanup()

			// Create package.json
			jsonData, _ := json.Marshal(tt.packageJSON)
			if err := os.WriteFile("package.json", jsonData, 0644); err != nil {
				t.Fatalf("Failed to create package.json: %v", err)
			}

			executor := &NextJSExecutor{
				instrumentationPath: filepath.Join(tempDir, "instrumentation.js"),
			}

			result := executor.getServiceNameFromPackageJSON()

			if tt.expected == "" {
				// Should fallback to directory name
				expectedDirName := filepath.Base(tempDir)
				if result != expectedDirName {
					t.Errorf("Expected fallback to directory name '%s', got '%s'", expectedDirName, result)
				}
			} else {
				if result != tt.expected {
					t.Errorf("getServiceNameFromPackageJSON() = %v, want %v", result, tt.expected)
				}
			}
		})
	}
}

func TestNextJSExecutor_GetServiceNameFromPackageJSON_NoFile(t *testing.T) {
	tempDir, cleanup := setupTestEnvironment(t)
	defer cleanup()

	// Don't create package.json file

	executor := &NextJSExecutor{
		instrumentationPath: filepath.Join(tempDir, "instrumentation.js"),
	}

	result := executor.getServiceNameFromPackageJSON()

	// Should fallback to directory name
	expectedDirName := filepath.Base(tempDir)
	if result != expectedDirName {
		t.Errorf("Expected fallback to directory name '%s', got '%s'", expectedDirName, result)
	}
}

func TestNextJSExecutor_GetServiceNameFromPackageJSON_InvalidJSON(t *testing.T) {
	tempDir, cleanup := setupTestEnvironment(t)
	defer cleanup()

	// Create invalid package.json
	invalidJSON := `{"name": "test", "invalid": json}`
	if err := os.WriteFile("package.json", []byte(invalidJSON), 0644); err != nil {
		t.Fatalf("Failed to create invalid package.json: %v", err)
	}

	executor := &NextJSExecutor{
		instrumentationPath: filepath.Join(tempDir, "instrumentation.js"),
	}

	result := executor.getServiceNameFromPackageJSON()

	// Should fallback to directory name
	expectedDirName := filepath.Base(tempDir)
	if result != expectedDirName {
		t.Errorf("Expected fallback to directory name '%s', got '%s'", expectedDirName, result)
	}
}

func TestNextJSExecutor_CreateCommand(t *testing.T) {
	tempDir, cleanup := setupTestEnvironment(t)
	defer cleanup()

	// Create package.json
	packageJSON := map[string]interface{}{
		"name": "test-service",
	}
	jsonData, _ := json.Marshal(packageJSON)
	if err := os.WriteFile("package.json", jsonData, 0644); err != nil {
		t.Fatalf("Failed to create package.json: %v", err)
	}

	instrumentationPath := filepath.Join(tempDir, "instrumentation.js")
	executor := &NextJSExecutor{
		instrumentationPath: instrumentationPath,
	}

	cmd, err := executor.createCommand()
	if err != nil {
		t.Errorf("createCommand() error = %v", err)
	}

	// Verify command structure (cmd.Path contains the full path to npm)
	if !strings.HasSuffix(cmd.Path, "npm") {
		t.Errorf("Expected command path to end with 'npm', got '%s'", cmd.Path)
	}

	expectedArgs := []string{"npm", "run", "dev"}
	if len(cmd.Args) != len(expectedArgs) {
		t.Errorf("Expected %d args, got %d", len(expectedArgs), len(cmd.Args))
	}

	for i, expectedArg := range expectedArgs {
		if i < len(cmd.Args) && cmd.Args[i] != expectedArg {
			t.Errorf("Expected arg[%d] = '%s', got '%s'", i, expectedArg, cmd.Args[i])
		}
	}

	// Verify environment variables were set
	env := cmd.Env
	var foundNodeOptions, foundCollectorURL, foundOTELService bool

	for _, envVar := range env {
		if strings.HasPrefix(envVar, "NODE_OPTIONS=") {
			foundNodeOptions = true
			if !strings.Contains(envVar, instrumentationPath) {
				t.Errorf("NODE_OPTIONS should contain instrumentation path '%s', got '%s'", instrumentationPath, envVar)
			}
		}
		if strings.HasPrefix(envVar, "COLLECTOR_URL=") {
			foundCollectorURL = true
			if !strings.Contains(envVar, "http://localhost:7432") {
				t.Errorf("COLLECTOR_URL should be 'http://localhost:7432', got '%s'", envVar)
			}
		}
		if strings.HasPrefix(envVar, "OTEL_SERVICE_NAME=") {
			foundOTELService = true
			if !strings.Contains(envVar, "test-service") {
				t.Errorf("OTEL_SERVICE_NAME should be 'test-service', got '%s'", envVar)
			}
		}
	}

	if !foundNodeOptions {
		t.Error("NODE_OPTIONS environment variable not found")
	}
	if !foundCollectorURL {
		t.Error("COLLECTOR_URL environment variable not found")
	}
	if !foundOTELService {
		t.Error("OTEL_SERVICE_NAME environment variable not found")
	}

	// Verify working directory (may be resolved path)
	expectedDir, _ := filepath.EvalSymlinks(tempDir)
	actualDir, _ := filepath.EvalSymlinks(cmd.Dir)
	if actualDir != expectedDir {
		t.Errorf("Expected working directory '%s', got '%s'", expectedDir, actualDir)
	}
}

func TestNextJSExecutor_CreateCommand_ExistingNodeOptions(t *testing.T) {
	tempDir, cleanup := setupTestEnvironment(t)
	defer cleanup()

	// Set existing NODE_OPTIONS
	originalNodeOptions := os.Getenv("NODE_OPTIONS")
	defer os.Setenv("NODE_OPTIONS", originalNodeOptions)

	existingNodeOptions := "--max-old-space-size=4096"
	os.Setenv("NODE_OPTIONS", existingNodeOptions)

	// Create package.json
	packageJSON := map[string]interface{}{
		"name": "test-service",
	}
	jsonData, _ := json.Marshal(packageJSON)
	if err := os.WriteFile("package.json", jsonData, 0644); err != nil {
		t.Fatalf("Failed to create package.json: %v", err)
	}

	instrumentationPath := filepath.Join(tempDir, "instrumentation.js")
	executor := &NextJSExecutor{
		instrumentationPath: instrumentationPath,
	}

	cmd, err := executor.createCommand()
	if err != nil {
		t.Errorf("createCommand() error = %v", err)
	}

	// Find NODE_OPTIONS in environment
	var nodeOptionsValue string
	for _, envVar := range cmd.Env {
		if strings.HasPrefix(envVar, "NODE_OPTIONS=") {
			nodeOptionsValue = envVar
			break
		}
	}

	if nodeOptionsValue == "" {
		t.Fatal("NODE_OPTIONS not found in command environment")
	}

	// Should contain both existing options and the new require flag
	if !strings.Contains(nodeOptionsValue, existingNodeOptions) {
		t.Errorf("NODE_OPTIONS should contain existing options '%s', got '%s'", existingNodeOptions, nodeOptionsValue)
	}

	if !strings.Contains(nodeOptionsValue, "--require "+instrumentationPath) {
		t.Errorf("NODE_OPTIONS should contain require flag for instrumentation, got '%s'", nodeOptionsValue)
	}
}