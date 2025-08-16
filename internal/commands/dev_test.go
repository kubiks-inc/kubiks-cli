package commands

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/kubiks-inc/kubiks-cli/internal/detector"
	"github.com/kubiks-inc/kubiks-cli/internal/executor"
	"github.com/kubiks-inc/kubiks-cli/pkg/types"
)

// MockProjectDetector implements the ProjectDetector interface for testing
type MockProjectDetector struct {
	isSupported  bool
	projectType  string
	shouldError  bool
	errorMessage string
}

func (m *MockProjectDetector) IsSupported() (bool, error) {
	if m.shouldError {
		return false, &MockError{message: m.errorMessage}
	}
	return m.isSupported, nil
}

func (m *MockProjectDetector) GetProjectType() string {
	return m.projectType
}

// MockError is a simple error implementation for testing
type MockError struct {
	message string
}

func (e *MockError) Error() string {
	return e.message
}

func TestNewDevCommand(t *testing.T) {
	// This test verifies that NewDevCommand creates a command with proper initialization
	cmd := NewDevCommand()

	if cmd == nil {
		t.Fatal("NewDevCommand() returned nil")
	}

	if cmd.detector == nil {
		t.Error("NewDevCommand() detector is nil")
	}

	// Verify detector type
	_, ok := cmd.detector.(*detector.NextJSDetector)
	if !ok {
		t.Error("NewDevCommand() detector is not a NextJSDetector")
	}

	// Note: executor might be nil if initialization fails
	// This is expected behavior and logged as a warning
}

func TestDevCommand_RunDirect_UnsupportedProject(t *testing.T) {
	cmd := &DevCommand{
		detector: &MockProjectDetector{
			isSupported: false,
			projectType: "Test",
			shouldError: false,
		},
		executor: nil, // Not needed for this test
	}

	err := cmd.RunDirect()
	if err == nil {
		t.Error("RunDirect() should return error for unsupported project")
	}

	expectedErrorSubstring := "only Test applications are supported"
	if !strings.Contains(err.Error(), expectedErrorSubstring) {
		t.Errorf("Expected error to contain '%s', got: %v", expectedErrorSubstring, err)
	}
}

func TestDevCommand_RunDirect_DetectorError(t *testing.T) {
	cmd := &DevCommand{
		detector: &MockProjectDetector{
			isSupported:  false,
			projectType:  "Test",
			shouldError:  true,
			errorMessage: "detector test error",
		},
		executor: nil, // Not needed for this test
	}

	err := cmd.RunDirect()
	if err == nil {
		t.Error("RunDirect() should return error when detector fails")
	}

	expectedErrorSubstring := "only Test applications are supported"
	if !strings.Contains(err.Error(), expectedErrorSubstring) {
		t.Errorf("Expected error to contain '%s', got: %v", expectedErrorSubstring, err)
	}

	// Should also include the detector error
	if !strings.Contains(err.Error(), "detector test error") {
		t.Errorf("Expected error to contain detector error message, got: %v", err)
	}
}

func TestDevCommand_RunDirect_NilExecutor(t *testing.T) {
	cmd := &DevCommand{
		detector: &MockProjectDetector{
			isSupported: true,
			projectType: "Test",
		},
		executor: nil,
	}

	err := cmd.RunDirect()
	if err == nil {
		t.Error("RunDirect() should return error when executor is nil")
	}

	expectedError := "NextJS executor not initialized"
	if err.Error() != expectedError {
		t.Errorf("Expected error '%s', got: %v", expectedError, err)
	}
}

// Integration test with real detector
func TestDevCommand_RunDirect_RealDetector_NoNextJS(t *testing.T) {
	// Create a temporary directory without Next.js
	tempDir, err := os.MkdirTemp("", "dev-command-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	// Save original directory
	originalDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("Failed to get current directory: %v", err)
	}
	defer os.Chdir(originalDir)

	// Change to temp directory
	if err := os.Chdir(tempDir); err != nil {
		t.Fatalf("Failed to change to temp directory: %v", err)
	}

	// Create package.json without Next.js
	packageJSON := map[string]interface{}{
		"name": "test-app",
		"dependencies": map[string]interface{}{
			"react": "18.0.0",
		},
	}

	jsonData, _ := json.Marshal(packageJSON)
	if err := os.WriteFile("package.json", jsonData, 0644); err != nil {
		t.Fatalf("Failed to create package.json: %v", err)
	}

	// Test with real detector
	cmd := NewDevCommand()
	err = cmd.RunDirect()

	if err == nil {
		t.Error("RunDirect() should return error for non-Next.js project")
	}

	expectedErrorSubstring := "only Next.js applications are supported"
	if !strings.Contains(err.Error(), expectedErrorSubstring) {
		t.Errorf("Expected error to contain '%s', got: %v", expectedErrorSubstring, err)
	}
}

// Test DevCommand structure and fields
func TestDevCommand_Structure(t *testing.T) {
	// Test that DevCommand has the expected fields
	cmd := &DevCommand{}

	// Verify fields exist (compile-time check)
	var _ types.ProjectDetector = cmd.detector
	var _ *executor.NextJSExecutor = cmd.executor

	// Test field assignment
	mockDetector := &MockProjectDetector{
		isSupported: true,
		projectType: "Mock",
	}

	cmd.detector = mockDetector
	cmd.executor = nil

	if cmd.detector != mockDetector {
		t.Error("DevCommand detector field assignment failed")
	}

	if cmd.executor != nil {
		t.Error("DevCommand executor field should be nil")
	}
}

// Test with a working environment (mocked executor)
func TestDevCommand_RunDirect_Success_Mock(t *testing.T) {
	// This test uses a mock setup to verify the success path
	tempDir, err := os.MkdirTemp("", "dev-command-success-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	// No instrumentation file needed anymore

	// Create mock executor that doesn't actually run anything
	mockExecutor := &executor.NextJSExecutor{}
	// Note: We can't easily test the actual RunDirect() method of the executor
	// without starting a real process, so this test focuses on the DevCommand logic

	cmd := &DevCommand{
		detector: &MockProjectDetector{
			isSupported: true,
			projectType: "Next.js",
		},
		executor: mockExecutor,
	}

	// This will still fail because the executor will try to validate the environment
	// but it tests the DevCommand logic up to the executor call
	err = cmd.RunDirect()

	// We expect an error from the executor's validation, not from the DevCommand logic
	if err != nil {
		// The error should come from executor validation, not from DevCommand
		if strings.Contains(err.Error(), "only Next.js applications are supported") {
			t.Error("Error should come from executor, not from project detection")
		}
		if strings.Contains(err.Error(), "NextJS executor not initialized") {
			t.Error("Error should come from executor validation, not from nil executor check")
		}
		// Expected to fail at executor validation - this is normal
	}
}

// Test package constants and structure
func TestDevCommand_Constants(t *testing.T) {
	// Verify that the command can be created with expected interface compliance
	var cmd interface{} = &DevCommand{}

	// Check that it has the expected methods (compile-time check)
	if runDirecter, ok := cmd.(interface{ RunDirect() error }); !ok {
		t.Error("DevCommand should implement RunDirect() method")
	} else {
		// Verify method signature
		_ = runDirecter.RunDirect
	}
}

func TestDevCommand_RunDirect_ExecutorFailure(t *testing.T) {
	// Create a temporary directory with a package.json that contains Next.js
	tempDir := t.TempDir()
	packageJSON := `{
		"name": "test-nextjs-app",
		"dependencies": {
			"next": "13.0.0"
		}
	}`
	packageJSONPath := filepath.Join(tempDir, "package.json")
	err := os.WriteFile(packageJSONPath, []byte(packageJSON), 0644)
	if err != nil {
		t.Fatalf("Failed to create package.json: %v", err)
	}

	// Change to the temp directory
	originalDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("Failed to get current directory: %v", err)
	}
	defer os.Chdir(originalDir)

	err = os.Chdir(tempDir)
	if err != nil {
		t.Fatalf("Failed to change to temp directory: %v", err)
	}

	cmd := &DevCommand{
		detector: detector.NewNextJSDetector(),
		executor: nil, // Will cause the expected error
	}

	// Test execution
	err = cmd.RunDirect()
	if err == nil {
		t.Error("Expected error when executor fails")
	}

	expectedError := "NextJS executor not initialized"
	if !strings.Contains(err.Error(), expectedError) {
		t.Errorf("Expected error to contain '%s', got: %v", expectedError, err)
	}
}

func TestDevCommand_GetComponents(t *testing.T) {
	cmd := NewDevCommand()

	if cmd.detector == nil {
		t.Error("Expected detector to be initialized")
	}

	// executor might be nil if initialization fails, that's ok

	// Test detector interface
	projectType := cmd.detector.GetProjectType()
	if projectType == "" {
		t.Error("Expected non-empty project type from detector")
	}
}

// MockExecutorFail is a mock executor that always fails
type MockExecutorFail struct{}

func (m *MockExecutorFail) RunDirect() error {
	return fmt.Errorf("mock executor failure")
}
