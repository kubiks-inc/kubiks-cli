# Kubiks CLI

A command line tool for running and monitoring commands with OpenTelemetry integration. Kubiks CLI allows you to execute any command while automatically capturing and streaming its output to Kubiks' observability platform.

## Features

- Run any command with automatic OpenTelemetry instrumentation
- Real-time log streaming to Kubiks platform
- Structured logging with command execution events
- Easy configuration management

## Installation

### Using Go Install

```bash
go install github.com/kubiks-inc/kubiks-cli@latest
```

### From Source

```bash
git clone https://github.com/kubiks-inc/kubiks-cli.git
cd kubiks-cli
go build
```

## Configuration

Before using the CLI, you need to configure your authentication token:

```bash
kubiks config add-authtoken YOUR_TOKEN
```

The token will be securely stored in `~/.config/kubiks/config.json`.

## Usage

### Running Commands

Run any command and monitor its output:

```bash
kubiks run "your-command-here"
```

Examples:

```bash
# Run a simple command
kubiks run "echo hello world"

# Run a long-running process
kubiks run "npm start"

# Run with multiple arguments
kubiks run "ls -la /path/to/directory"
```

### Options

- `-v, --verbose`: Enable verbose output
- `--service-name`: Set custom service name for telemetry (default: "kubiks-subprocess")

### Viewing Logs

All command output and execution events are automatically streamed to the Kubiks platform. You can view your logs in real-time at:

[https://app.kubiks.ai/logs](https://app.kubiks.ai/logs)

## Development

1. Clone the repository:

   ```bash
   git clone https://github.com/kubiks-inc/kubiks-cli.git
   ```

2. Install dependencies:

   ```bash
   go mod tidy
   ```

3. Build the project:

   ```bash
   go build
   ```

4. Run tests:
   ```bash
   go test ./...
   ```

## License

[Add your license information here]
