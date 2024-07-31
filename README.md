# Kubiks CLI

A command-line interface for managing development workflows with Next.js applications.

## Features

- Command-line interface built with Cobra
- Next.js project detection
- Development server management
- OpenTelemetry data collection and MCP server
- Proper signal handling and process cleanup

## Project Structure

```
kubiks-cli/
├── main.go                 # Application entry point
├── go.mod                  # Go module definition
├── internal/               # Private application packages
│   ├── commands/           # Command implementations
│   │   ├── dev.go         # Development server command
│   │   └── server.go      # OTEL and MCP server command
│   ├── detector/           # Project type detection
│   │   └── nextjs.go      # Next.js project detector
│   ├── executor/           # Command execution logic
│   ├── handlers/           # HTTP handlers for OTEL
│   └── mcp/               # MCP server implementation
└── pkg/                   # Public packages
    └── types/             # Shared types and interfaces
        └── types.go       # Common type definitions
```

## Architecture

The project follows Go best practices with a clean separation of concerns:

- **`main.go`**: Entry point that wires everything together
- **`internal/`**: Private packages not meant to be imported by other projects
  - **`commands/`**: Business logic for different CLI commands
  - **`detector/`**: Project type detection logic
  - **`executor/`**: Command execution and platform-specific logic
  - **`handlers/`**: HTTP handlers for OpenTelemetry endpoints
  - **`mcp/`**: Model Context Protocol server implementation
- **`pkg/`**: Public packages that could be reused by other projects
  - **`types/`**: Shared interfaces and data structures

## Usage

### Commands

- `kubiks run server` - Start the OpenTelemetry and MCP servers
- `kubiks run nextjs` - Start a Next.js development server with OpenTelemetry instrumentation
- `kubiks help` - Show help for available commands

### Examples

```bash
# Start the OTEL and MCP servers
kubiks run server

# Start Next.js development server with instrumentation
cd /path/to/nextjs/project
kubiks run nextjs

# Show help
kubiks help
```

## Development

To build the project:

```bash
# Using Makefile (recommended)
make build

# Or directly with Go
go build -o bin/kubiks
```

### Makefile Commands

- `make build` - Build the application in bin/ directory
- `make clean` - Clean build artifacts
- `make run` - Build and run the application
- `make deps` - Install dependencies
- `make test` - Run tests
- `make fmt` - Format code
- `make build-all` - Build for multiple platforms
- `make help` - Show all available commands

### Server Management
- The OTEL server runs on port 7432 by default
- The MCP server runs on port 7433 by default
- Use Ctrl+C to stop running servers gracefully

### Next.js Development
- Ensure you're in a Next.js project directory before running `kubiks run nextjs`
- The instrumentation will automatically inject OpenTelemetry into your development server
- Data will be sent to the OTEL server (start with `kubiks run server` first)

## Dependencies

- [Cobra](https://github.com/spf13/cobra) - Modern CLI framework for Go
- [MCP-Go](https://github.com/mark3labs/mcp-go) - Model Context Protocol implementation
- [SQLite](https://github.com/mattn/go-sqlite3) - Database driver for OpenTelemetry data storage

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 