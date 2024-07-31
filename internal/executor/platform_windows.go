//go:build windows

package executor

import (
	"os/exec"
	"syscall"
)

// configurePlatformSpecific configures platform-specific process attributes for Windows
func configurePlatformSpecific(cmd *exec.Cmd) {
	// On Windows, we use different process creation flags
	cmd.SysProcAttr = &syscall.SysProcAttr{
		CreationFlags: syscall.CREATE_NEW_PROCESS_GROUP,
	}
}