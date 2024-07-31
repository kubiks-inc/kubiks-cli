//go:build unix

package executor

import (
	"os/exec"
	"syscall"
)

// configurePlatformSpecific configures platform-specific process attributes for Unix-like systems
func configurePlatformSpecific(cmd *exec.Cmd) {
	// Set process group for proper signal handling on Unix-like systems
	cmd.SysProcAttr = &syscall.SysProcAttr{
		Setpgid: true,
		Pgid:    0,
	}
}