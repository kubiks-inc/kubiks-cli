package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var configCmd = &cobra.Command{
	Use:   "config",
	Short: "Manage Kubiks configuration",
	Long:  `Manage Kubiks configuration settings like authentication tokens.`,
}

var addAuthTokenCmd = &cobra.Command{
	Use:   "add-authtoken TOKEN",
	Short: "Add or update authentication token",
	Long:  `Add or update the authentication token used for Kubiks services.`,
	Args:  cobra.ExactArgs(1),
	RunE:  addAuthToken,
}

func init() {
	rootCmd.AddCommand(configCmd)
	configCmd.AddCommand(addAuthTokenCmd)
}

func addAuthToken(cmd *cobra.Command, args []string) error {
	token := args[0]

	// Ensure config directory exists
	home, err := os.UserHomeDir()
	if err != nil {
		return fmt.Errorf("failed to get home directory: %w", err)
	}

	configDir := filepath.Join(home, ".config", "kubiks")
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	// Set the token in viper
	viper.Set("auth_token", token)

	// Save config
	configFile := filepath.Join(configDir, "config.json")
	viper.SetConfigFile(configFile)

	if err := viper.WriteConfig(); err != nil {
		// If config file does not exist, try to create it
		if err := viper.SafeWriteConfig(); err != nil {
			return fmt.Errorf("failed to write config file: %w", err)
		}
	}

	fmt.Printf("Authentication token saved to %s\n", configFile)
	return nil
} 
