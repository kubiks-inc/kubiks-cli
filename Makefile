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
	@echo "Building UI..."
	@cd ui && npm install --silent && npm run build
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
	@go test -v ./...

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	@go test -v -race -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

# Run tests with coverage and show percentage
test-coverage-report:
	@echo "Running tests with coverage report..."
	@go test -v -race -coverprofile=coverage.out ./...
	@go tool cover -func=coverage.out

# Format code
fmt:
	@echo "Formatting code..."
	@go fmt ./...

# Lint code (disabled)
# lint:
# 	@echo "Linting code..."
# 	@golangci-lint run

# Build for multiple platforms
build-all: clean
	@echo "Building for multiple platforms..."
	@mkdir -p $(BIN_DIR)
	@echo "Building UI..."
	@cd ui && npm install --silent && npm run build
	@echo "Building for Linux (amd64)..."
	@GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o $(BIN_DIR)/$(BINARY_NAME)-linux-amd64 $(MAIN_FILE)
	@echo "Building for Linux (arm64)..."
	@GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -ldflags="-s -w" -o $(BIN_DIR)/$(BINARY_NAME)-linux-arm64 $(MAIN_FILE)
	@echo "Building for macOS (amd64)..."
	@GOOS=darwin GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o $(BIN_DIR)/$(BINARY_NAME)-darwin-amd64 $(MAIN_FILE)
	@echo "Building for macOS (arm64)..."
	@GOOS=darwin GOARCH=arm64 CGO_ENABLED=0 go build -ldflags="-s -w" -o $(BIN_DIR)/$(BINARY_NAME)-darwin-arm64 $(MAIN_FILE)
	@echo "Building for Windows (amd64)..."
	@GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o $(BIN_DIR)/$(BINARY_NAME)-windows-amd64.exe $(MAIN_FILE)
	@echo "Build complete for all platforms"

# Create release archives
release: build-all
	@echo "Creating release archives..."
	@mkdir -p dist
	@cd $(BIN_DIR) && tar -czf ../dist/$(BINARY_NAME)-linux-amd64.tar.gz $(BINARY_NAME)-linux-amd64
	@cd $(BIN_DIR) && tar -czf ../dist/$(BINARY_NAME)-linux-arm64.tar.gz $(BINARY_NAME)-linux-arm64
	@cd $(BIN_DIR) && tar -czf ../dist/$(BINARY_NAME)-darwin-amd64.tar.gz $(BINARY_NAME)-darwin-amd64
	@cd $(BIN_DIR) && tar -czf ../dist/$(BINARY_NAME)-darwin-arm64.tar.gz $(BINARY_NAME)-darwin-arm64
	@zip ../dist/$(BINARY_NAME)-windows-amd64.zip $(BINARY_NAME)-windows-amd64.exe
	@echo "Release archives created in dist/"

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
	@echo "  lint         - Lint code (disabled)"
	@echo "  build-all    - Build for multiple platforms"
	@echo "  help         - Show this help message"

.PHONY: build clean run deps test test-coverage fmt build-all help