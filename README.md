# Kubiks CLI

A command-line interface built with [Bubble Tea](https://github.com/charmbracelet/bubbletea) 🫧

## About

Kubiks CLI is a terminal user interface (TUI) application that demonstrates the power of Bubble Tea framework. This hello world implementation showcases interactive terminal applications with beautiful styling using Lip Gloss.

## Features

- 🎨 Beautiful terminal UI with colors and styling
- ⌨️ Interactive keyboard controls
- 🚀 Built with Go and Bubble Tea framework
- 🎯 Clean, modern architecture following The Elm Architecture pattern

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

- Press **SPACE** or **ENTER** to interact with the application
- Press **q**, **Ctrl+C**, or **ESC** to quit

## Dependencies

- [Bubble Tea](https://github.com/charmbracelet/bubbletea) - TUI framework
- [Lip Gloss](https://github.com/charmbracelet/lipgloss) - Styling library

## Architecture

This application follows the Bubble Tea framework structure:

- **Model**: Represents the application state
- **Init**: Initializes the application
- **Update**: Handles messages and updates the model
- **View**: Renders the UI based on the current state

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 