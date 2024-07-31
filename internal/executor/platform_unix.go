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

// killProcessGroup kills the entire process group on Unix-like systems
func killProcessGroup(pid int) error {
	// Send SIGTERM to the entire process group
	return syscall.Kill(-pid, syscall.SIGTERM)
}
