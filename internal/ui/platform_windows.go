//go:build windows

package ui

import (
	"os/exec"
	"syscall"
)

// killProcessGroup kills the process group for Windows
func killProcessGroup(cmd *exec.Cmd) {
	if cmd != nil && cmd.Process != nil {
		// On Windows, we send a CTRL_BREAK_EVENT to terminate the process group
		dll, err := syscall.LoadDLL("kernel32.dll")
		if err != nil {
			// Fallback to killing just the process
			cmd.Process.Kill()
			return
		}
		defer dll.Release()

		proc, err := dll.FindProc("GenerateConsoleCtrlEvent")
		if err != nil {
			// Fallback to killing just the process
			cmd.Process.Kill()
			return
		}

		// Send CTRL_BREAK_EVENT (1) to the process group
		proc.Call(uintptr(1), uintptr(cmd.Process.Pid))
	}
}