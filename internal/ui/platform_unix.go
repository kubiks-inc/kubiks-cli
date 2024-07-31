//go:build unix

package ui

import (
	"os/exec"
	"syscall"
)

// killProcessGroup kills the process group for Unix-like systems
func killProcessGroup(cmd *exec.Cmd) {
	if cmd != nil && cmd.Process != nil {
		// Kill the entire process group
		pgid, err := syscall.Getpgid(cmd.Process.Pid)
		if err == nil {
			syscall.Kill(-pgid, syscall.SIGTERM)
		}
	}
}