# Kubiks CLI

A command-line interface for managing development workflows with Next.js applications.

## Features

- Interactive terminal UI built with Bubble Tea
- Next.js project detection
- Development server management
- Proper signal handling and process cleanup

## Project Structure

```
kubiks-cli/
├── main.go                 # Application entry point
├── go.mod                  # Go module definition
├── internal/               # Private application packages
│   ├── commands/           # Command implementations
│   │   └── dev.go         # Development server command
│   ├── detector/           # Project type detection
│   │   └── nextjs.go      # Next.js project detector
│   └── ui/                # User interface components
│       ├── model.go       # Bubble Tea model
│       └── styles.go      # UI styling definitions
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
  - **`ui/`**: User interface components and styling
- **`pkg/`**: Public packages that could be reused by other projects
  - **`types/`**: Shared interfaces and data structures

## Usage

1. Navigate to a Next.js project directory
2. Run `./kubiks`
3. Use arrow keys to navigate and Enter to execute commands
4. Press `q` or `Ctrl+C` to quit

## Development

To build the project:

```bash
go build -o kubiks
```

### Navigation
- Press **↑/k** to move up in the menu
- Press **↓/j** to move down in the menu
- Press **Enter** or **Space** to execute the selected command

### Help & Utilities
- Press **h** or **?** to toggle help information
- Press **c** to clear the last command output
- Press **q**, **Ctrl+C**, or **Esc** to quit

### Command Execution
1. Navigate to the desired command using arrow keys
2. Press Enter to execute
3. Watch the real-time execution feedback
4. View results (errors will be displayed with full output)

## Dependencies

- [Bubble Tea](https://github.com/charmbracelet/bubbletea) - Terminal UI framework
- [Lipgloss](https://github.com/charmbracelet/lipgloss) - Style definitions for terminal UIs

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 