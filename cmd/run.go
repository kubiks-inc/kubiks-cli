package cmd

import (
	"fmt"
	"os"
	"os/exec"

	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var runCmd = &cobra.Command{
	Use:   "run [command]",
	Short: "Run a command",
	Long:  `Run a command and display its output.`,
	Args:  cobra.MinimumNArgs(1),
	RunE:  runCommand,
}

func init() {
	rootCmd.AddCommand(runCmd)
	runCmd.Flags().BoolVarP(&verbose, "verbose", "v", false, "verbose output")
}

func runCommand(cmd *cobra.Command, args []string) error {
	command := exec.CommandContext(cmd.Context(), args[0], args[1:]...)
	command.Stdout = os.Stdout
	command.Stderr = os.Stderr

	if verbose {
		color.Green("Running command: %s", command.String())
	}

	if err := command.Run(); err != nil {
		return fmt.Errorf("command failed: %w", err)
	}

	return nil
} 
