package cmd

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/fatih/color"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var (
	cfgFile     string
	serviceName string
	verbose     bool
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "kubiks",
	Short: color.New(color.FgCyan, color.Bold).Sprint("🚀 Kubiks - OpenTelemetry Process Monitor"),
	Long: color.New(color.FgCyan).Sprint(`
╭──────────────────────────────────────────────────────────-╮
│  🚀 Kubiks - OpenTelemetry Process Monitor                │
│                                                           │
│  Run any command and automatically send stdout/stderr     │
│  as structured OpenTelemetry logs to your collector.      │
│                                                           │
│  Perfect for monitoring CI/CD pipelines, debugging        │
│  applications, and creating observability for any process.│
╰──────────────────────────────────────────────────────────-╯`),
	Example: color.New(color.FgYellow).Sprint(`  # Run a simple command with default settings
  kubiks run "echo hello world"

  # Monitor a long-running process with custom service name
  kubiks run --service-name my-app "npm start"

  # Configure auth token
  kubiks config add-authtoken YOUR_TOKEN`),
}

// Execute adds all child commands to the root command and sets flags appropriately.
func Execute(ctx context.Context) error {
	return rootCmd.ExecuteContext(ctx)
}

func init() {
	cobra.OnInitialize(initConfig)

	// Global flags
	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.config/kubiks/config.json)")
	rootCmd.PersistentFlags().StringVar(&serviceName, "service-name", "kubiks-subprocess", "Service name for OpenTelemetry traces")
	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "Enable verbose output")

	// Bind flags to viper
	viper.BindPFlag("service-name", rootCmd.PersistentFlags().Lookup("service-name"))
	viper.BindPFlag("verbose", rootCmd.PersistentFlags().Lookup("verbose"))
}

// initConfig reads in config file and ENV variables if set.
func initConfig() {
	if cfgFile != "" {
		// Use config file from the flag.
		viper.SetConfigFile(cfgFile)
	} else {
		// Find home directory.
		home, err := os.UserHomeDir()
		cobra.CheckErr(err)

		// Search config in home directory
		viper.AddConfigPath(filepath.Join(home, ".config", "kubiks"))
		viper.SetConfigType("json")
		viper.SetConfigName("config")
	}

	viper.AutomaticEnv() // read in environment variables that match

	// If a config file is found, read it in.
	if err := viper.ReadInConfig(); err == nil && verbose {
		fmt.Fprintln(os.Stderr, color.New(color.FgGreen).Sprint("📄 Using config file:", viper.ConfigFileUsed()))
	}
} 
