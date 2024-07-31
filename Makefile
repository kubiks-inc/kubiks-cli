# Kubiks CLI Makefile

# Variables
BINARY_NAME=kubiks
BIN_DIR=bin
MAIN_FILE=main.go

# Default target
.DEFAULT_GOAL := build

# Build the application
build:
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p $(BIN_DIR)
	@go build -o $(BIN_DIR)/$(BINARY_NAME) $(MAIN_FILE)
	@echo "Built $(BINARY_NAME) in $(BIN_DIR)/"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(BIN_DIR)
	@rm -f $(BINARY_NAME)
	@echo "Clean complete"

# Run the application
run: build
	@echo "Running $(BINARY_NAME)..."
	@./$(BIN_DIR)/$(BINARY_NAME)

# Install dependencies
deps:
	@echo "Installing dependencies..."
	@go mod tidy
	@go mod download

# Run tests
test:
	@echo "Running tests..."
	@go test ./...

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	@go test -cover ./...

# Format code
fmt:
	@echo "Formatting code..."
	@go fmt ./...

# Lint code
lint:
	@echo "Linting code..."
	@golangci-lint run

# Build for multiple platforms
build-all: clean
	@echo "Building for multiple platforms..."
	@mkdir -p $(BIN_DIR)
	@echo "Building for Linux (amd64)..."
	@GOOS=linux GOARCH=amd64 go build -o $(BIN_DIR)/$(BINARY_NAME)-linux-amd64 $(MAIN_FILE)
	@echo "Building for macOS (amd64)..."
	@GOOS=darwin GOARCH=amd64 go build -o $(BIN_DIR)/$(BINARY_NAME)-darwin-amd64 $(MAIN_FILE)
	@echo "Building for macOS (arm64)..."
	@GOOS=darwin GOARCH=arm64 go build -o $(BIN_DIR)/$(BINARY_NAME)-darwin-arm64 $(MAIN_FILE)
	@echo "Building for Windows (amd64)..."
	@GOOS=windows GOARCH=amd64 go build -o $(BIN_DIR)/$(BINARY_NAME)-windows-amd64.exe $(MAIN_FILE)
	@echo "Cross-platform builds complete"

# Help target
help:
	@echo "Available targets:"
	@echo "  build        - Build the application"
	@echo "  clean        - Clean build artifacts"
	@echo "  run          - Build and run the application"
	@echo "  deps         - Install dependencies"
	@echo "  test         - Run tests"
	@echo "  test-coverage- Run tests with coverage"
	@echo "  fmt          - Format code"
	@echo "  lint         - Lint code (requires golangci-lint)"
	@echo "  build-all    - Build for multiple platforms"
	@echo "  help         - Show this help message"

.PHONY: build clean run deps test test-coverage fmt lint build-all help