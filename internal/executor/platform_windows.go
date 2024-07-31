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

// killProcessGroup kills the entire process group on Windows
func killProcessGroup(pid int) error {
	// On Windows, we need to send CTRL_BREAK_EVENT to the process group
	dll := syscall.MustLoadDLL("kernel32.dll")
	proc := dll.MustFindProc("GenerateConsoleCtrlEvent")

	// CTRL_BREAK_EVENT = 1, pid = process group id
	ret, _, err := proc.Call(uintptr(1), uintptr(pid))
	if ret == 0 {
		return err
	}
	return nil
}
