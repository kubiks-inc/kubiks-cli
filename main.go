package main

import (
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"strings"
	"syscall"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// Define styles for our UI
var (
	titleStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#FAFAFA")).
			Background(lipgloss.Color("#7D56F4")).
			Padding(0, 1).
			Bold(true)

	selectedStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#FAFAFA")).
			Background(lipgloss.Color("#04B575")).
			Padding(0, 1).
			Bold(true)

	commandStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#04B575")).
			Margin(0, 1)

	unselectedStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#626262")).
			Margin(0, 1)

	helpStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#626262")).
			Margin(1, 0)

	errorStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#FF5F87")).
			Bold(true).
			Margin(1, 0)

	successStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#04B575")).
			Bold(true).
			Margin(1, 0)
)

// Command represents a CLI command
type Command struct {
	name        string
	description string
	action      func() tea.Cmd
}

// model represents the state of our application
type model struct {
	commands    []Command
	cursor      int
	executing   bool
	lastOutput  string
	lastError   error
	showingHelp bool
	currentCmd  *exec.Cmd
}

// commandExecutedMsg is sent when a command finishes executing
type commandExecutedMsg struct {
	output string
	err    error
}

// commandStartedMsg is sent when a command starts executing
type commandStartedMsg struct {
	cmd *exec.Cmd
}

// runNpmDev executes npm run dev command
func runNpmDev() tea.Cmd {
	return func() tea.Msg {
		cmd := exec.Command("npm", "run", "dev")
		// Set process group to allow killing child processes
		cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
		
		// Start the command
		err := cmd.Start()
		if err != nil {
			return commandExecutedMsg{
				output: "",
				err:    err,
			}
		}
		
		// Send message that command started
		return commandStartedMsg{cmd: cmd}
	}
}

// Init is called when the program starts
func (m model) Init() tea.Cmd {
	return nil
}

// killChildProcess kills the current running command and its child processes
func (m *model) killChildProcess() {
	if m.currentCmd != nil && m.currentCmd.Process != nil {
		// Kill the entire process group
		pgid, err := syscall.Getpgid(m.currentCmd.Process.Pid)
		if err == nil {
			syscall.Kill(-pgid, syscall.SIGTERM)
		}
		m.currentCmd = nil
	}
}

// Update handles messages and updates the model
func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		if m.executing {
			// If we're executing a command, only allow quit
			switch msg.String() {
			case "ctrl+c", "q":
				m.killChildProcess()
				return m, tea.Quit
			}
			return m, nil
		}

		switch msg.String() {
		case "ctrl+c", "q", "esc":
			m.killChildProcess()
			return m, tea.Quit
		case "up", "k":
			if m.cursor > 0 {
				m.cursor--
			}
		case "down", "j":
			if m.cursor < len(m.commands)-1 {
				m.cursor++
			}
		case "enter", " ":
			// Execute the selected command
			if m.cursor < len(m.commands) {
				m.executing = true
				m.lastOutput = ""
				m.lastError = nil
				return m, m.commands[m.cursor].action()
			}
		case "h", "?":
			m.showingHelp = !m.showingHelp
		case "c":
			// Clear last output
			m.lastOutput = ""
			m.lastError = nil
		}

	case commandStartedMsg:
		m.currentCmd = msg.cmd
		// Wait for the command to complete
		return m, func() tea.Msg {
			err := msg.cmd.Wait()
			var output []byte
			if err != nil {
				// Try to get any output even if there was an error
				if msg.cmd.Stdout != nil {
					// Note: For simplicity, we're not capturing output in this version
					// In a real implementation, you'd want to pipe stdout/stderr
				}
			}
			return commandExecutedMsg{
				output: string(output),
				err:    err,
			}
		}

	case commandExecutedMsg:
		m.executing = false
		m.lastOutput = msg.output
		m.lastError = msg.err
		m.currentCmd = nil
	}

	return m, nil
}

// View renders the UI
func (m model) View() string {
	var s strings.Builder

	// Title
	s.WriteString(titleStyle.Render("Kubiks CLI"))
	s.WriteString("\n\n")

	if m.executing {
		s.WriteString("🔄 Executing command...\n\n")
		s.WriteString(helpStyle.Render("Press q or ctrl+c to quit"))
		return s.String()
	}

	// Commands menu
	s.WriteString("Available Commands:\n\n")
	for i, cmd := range m.commands {
		cursor := "  "
		style := unselectedStyle

		if m.cursor == i {
			cursor = "▶ "
			style = selectedStyle
		}

		s.WriteString(cursor)
		s.WriteString(style.Render(cmd.name))
		s.WriteString(" - ")
		s.WriteString(cmd.description)
		s.WriteString("\n")
	}

	// Show command output if there was an execution
	if m.lastOutput != "" || m.lastError != nil {
		s.WriteString("\n")
		s.WriteString("Last Command Result:\n")

		if m.lastError != nil {
			s.WriteString(errorStyle.Render(fmt.Sprintf("❌ Error: %v", m.lastError)))
			s.WriteString("\n")
			if m.lastOutput != "" {
				s.WriteString(errorStyle.Render("Output:"))
				s.WriteString("\n")
				s.WriteString(m.lastOutput)
			}
		} else {
			s.WriteString(successStyle.Render("✅ Command executed successfully"))
			if m.lastOutput != "" {
				s.WriteString("\n")
				s.WriteString("Output:\n")
				s.WriteString(m.lastOutput)
			}
		}
		s.WriteString("\n")
	}

	// Help section
	if m.showingHelp {
		s.WriteString("\n")
		s.WriteString(helpStyle.Render("Help:"))
		s.WriteString("\n")
		s.WriteString(helpStyle.Render("↑/k: Move up"))
		s.WriteString("\n")
		s.WriteString(helpStyle.Render("↓/j: Move down"))
		s.WriteString("\n")
		s.WriteString(helpStyle.Render("Enter/Space: Execute command"))
		s.WriteString("\n")
		s.WriteString(helpStyle.Render("h/?: Toggle help"))
		s.WriteString("\n")
		s.WriteString(helpStyle.Render("c: Clear last output"))
		s.WriteString("\n")
		s.WriteString(helpStyle.Render("q/Ctrl+C/Esc: Quit"))
		s.WriteString("\n")
	}

	// Footer
	s.WriteString("\n")
	if m.showingHelp {
		s.WriteString(helpStyle.Render("Press h or ? to hide help • Press q to quit"))
	} else {
		s.WriteString(helpStyle.Render("Press ↑/↓ to navigate • Enter to execute • h for help • q to quit"))
	}

	return s.String()
}

// initialModel returns the initial state
func initialModel() model {
	commands := []Command{
		{
			name:        "run",
			description: "Run npm run dev in current directory",
			action:      runNpmDev,
		},
		{
			name:        "exit",
			description: "Exit the application",
			action: func() tea.Cmd {
				return tea.Quit
			},
		},
	}

	return model{
		commands:    commands,
		cursor:      0,
		executing:   false,
		showingHelp: false,
	}
}

func main() {
	// Create a new Bubble Tea program
	m := initialModel()
	p := tea.NewProgram(m)

	// Set up signal handling
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Handle signals in a separate goroutine
	go func() {
		<-sigChan
		// Kill any running child processes
		if m.currentCmd != nil && m.currentCmd.Process != nil {
			pgid, err := syscall.Getpgid(m.currentCmd.Process.Pid)
			if err == nil {
				syscall.Kill(-pgid, syscall.SIGTERM)
			}
		}
		// Exit cleanly
		p.Quit()
	}()

	// Run the program
	if _, err := p.Run(); err != nil {
		fmt.Printf("Alas, there's been an error: %v", err)
		os.Exit(1)
	}
}
