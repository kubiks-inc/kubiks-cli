# Kubiks CLI

A command line tool for running and managing commands.

## Installation

```bash
go install github.com/kubiks-inc/kubiks-cli@latest
```

## Usage

### Run a command

Run any command and see its output:

```bash
kubiks run <command>
```

Example:

```bash
kubiks run ls -la
kubiks run echo "Hello, World!"
```

Options:

- `-v, --verbose`: Enable verbose output
- `--config`: Specify a custom config file path (default: ~/.kubiks/config.json)

### Configure

Configure the CLI settings:

```bash
kubiks configure
```

This will prompt you for:

- Authentication token

The configuration is stored in `~/.kubiks/config.json` by default.

## Development

1. Clone the repository
2. Install dependencies: `go mod tidy`
3. Build: `go build`
4. Run tests: `go test ./...`
