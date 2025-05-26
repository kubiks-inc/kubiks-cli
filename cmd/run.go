package cmd

import (
	"context"
	"fmt"
	"os/exec"
	"strings"
	"time"

	"github.com/fatih/color"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"go.opentelemetry.io/otel/log"

	"github.com/kubiks-inc/kubiks-cli/pkg/otel"
)

// otelExporter handles sending logs to OpenTelemetry
type otelExporter struct {
	serviceName string
	command     string
	provider    *otel.LogProvider
	ctx         context.Context
}

// newOtelExporter creates a new OpenTelemetry exporter
func newOtelExporter(ctx context.Context, serviceName, command string) (*otelExporter, error) {
	token := viper.GetString("auth_token")
	if token == "" {
		return nil, fmt.Errorf("authentication token not found. Please run 'kubiks config add-authtoken YOUR_TOKEN' first")
	}

	provider, err := otel.NewLogProvider(token, serviceName)
	if err != nil {
		return nil, fmt.Errorf("failed to create log provider: %w", err)
	}

	return &otelExporter{
		serviceName: serviceName,
		command:     command,
		provider:    provider,
		ctx:         ctx,
	}, nil
}

// Write implements io.Writer to capture and export stdout/stderr
func (e *otelExporter) Write(p []byte) (n int, err error) {
	record := log.Record{}
	record.SetTimestamp(time.Now())
	record.SetSeverityText("INFO")
	record.SetBody(log.StringValue(string(p)))
	record.AddAttributes(
		log.String("service.name", e.serviceName),
		log.String("command", e.command),
		log.String("event.type", "command.output"),
	)
	e.provider.EmitLogRecord(e.ctx, record)
	return len(p), nil
}

// exportCommandStart sends a log entry when command starts
func (e *otelExporter) exportCommandStart() {
	record := log.Record{}
	record.SetTimestamp(time.Now())
	record.SetSeverityText("INFO")
	record.SetBody(log.StringValue("Command started"))
	record.AddAttributes(
		log.String("service.name", e.serviceName),
		log.String("command", e.command),
		log.String("event.type", "command.start"),
	)
	e.provider.EmitLogRecord(e.ctx, record)
}

// exportCommandEnd sends a log entry when command ends
func (e *otelExporter) exportCommandEnd(err error) {
	attrs := []log.KeyValue{
		log.String("service.name", e.serviceName),
		log.String("command", e.command),
		log.String("event.type", "command.end"),
		log.String("status", "success"),
	}

	if err != nil {
		attrs = append(attrs,
			log.String("status", "error"),
			log.String("error.message", err.Error()),
		)
	}

	record := log.Record{}
	record.SetTimestamp(time.Now())
	record.SetSeverityText("INFO")
	record.SetBody(log.StringValue("Command completed"))
	record.AddAttributes(attrs...)
	e.provider.EmitLogRecord(e.ctx, record)
}

var runCmd = &cobra.Command{
	Use:   "run \"command\"",
	Short: "Run a command",
	Long:  `Run a command and display its output. The command should be passed as a single quoted string.`,
	Example: `  kubiks run "echo hello world"
  kubiks run "ls -la"
  kubiks run "npm start"`,
	Args: cobra.ExactArgs(1),
	RunE: runCommand,
}

func init() {
	rootCmd.AddCommand(runCmd)
	runCmd.Flags().BoolVarP(&verbose, "verbose", "v", false, "verbose output")
}

func runCommand(cmd *cobra.Command, args []string) error {
	// Split the command string into command and arguments
	cmdParts := strings.Fields(args[0])
	if len(cmdParts) == 0 {
		return fmt.Errorf("empty command")
	}

	// Create OpenTelemetry exporter
	exporter, err := newOtelExporter(cmd.Context(), serviceName, args[0])
	if err != nil {
		return fmt.Errorf("failed to create telemetry exporter: %w", err)
	}
	defer exporter.provider.Shutdown(cmd.Context())
	
	command := exec.CommandContext(cmd.Context(), cmdParts[0], cmdParts[1:]...)
	
	// Redirect stdout/stderr to our telemetry system
	command.Stdout = exporter
	command.Stderr = exporter

	if verbose {
		color.Green("Running command: %s", command.String())
	}

	fmt.Println()
	color.Cyan("🚀 Running your command with Kubiks...")
	fmt.Println()
	fmt.Printf("📊 View logs in real-time at: %s\n", color.CyanString("https://app.kubiks.ai/logs"))
	fmt.Println()
	
	// Export command start event
	exporter.exportCommandStart()
	
	err = command.Run()
	
	// Export command end event
	exporter.exportCommandEnd(err)
	
	if err != nil {
		return fmt.Errorf("command failed: %w", err)
	}

	// Show success message
	fmt.Println()
	color.Green("✨ Command executed successfully!")
	fmt.Println()

	return nil
} 
