# Kubiks CLI

A command-line interface built with [Bubble Tea](https://github.com/charmbracelet/bubbletea) 🫧

## About

Kubiks CLI is a terminal user interface (TUI) application that provides an interactive command menu system. Built with the powerful Bubble Tea framework, it offers a beautiful and intuitive way to execute development commands from the terminal.

## Features

- 🎨 Beautiful terminal UI with colors and styling
- ⌨️ Interactive keyboard navigation
- 🚀 Built with Go and Bubble Tea framework
- 🎯 Clean, modern architecture following The Elm Architecture pattern
- 📋 Command menu system for easy command selection
- ⚡ Asynchronous command execution with proper error handling
- 🔄 Real-time command execution feedback

## Available Commands

### `run`
Executes `npm run dev` in the current directory. This command:
- Suppresses output on successful execution (exit code 0)
- Shows full output and error details if the command fails (non-zero exit code)
- Provides visual feedback during execution

### `exit`
Exits the application gracefully.

## Installation

### From Source

```bash
git clone https://github.com/kubiks-inc/kubiks-cli.git
cd kubiks-cli
go build -o kubiks-cli
./kubiks-cli
```

### Development

```bash
# Run directly with Go
go run main.go

# Build the binary
go build -o kubiks-cli

# Run the binary
./kubiks-cli
```

## Usage

Once you run the application:

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

- [Bubble Tea](https://github.com/charmbracelet/bubbletea) - TUI framework
- [Lip Gloss](https://github.com/charmbracelet/lipgloss) - Styling library

## Architecture

This application follows the Bubble Tea framework structure:

- **Model**: Represents the application state including commands, cursor position, and execution status
- **Init**: Initializes the application
- **Update**: Handles messages (keypresses, command results) and updates the model
- **View**: Renders the UI based on the current state

### Command System

Commands are defined as structs with:
- `name`: Display name in the menu
- `description`: Help text describing what the command does
- `action`: Function that returns a Bubble Tea command to execute

## Error Handling

The CLI provides comprehensive error handling:
- **Successful commands**: Shows success indicator, suppresses output unless needed
- **Failed commands**: Shows error message with full command output
- **Execution feedback**: Visual indicators during command execution
- **Graceful exit**: Proper cleanup on quit

## Testing

A test `package.json` file is included for testing the `npm run dev` functionality. The dev script simulates a development server startup.

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 