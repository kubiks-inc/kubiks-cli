package ui

import (
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"strings"
	"syscall"

	tea "github.com/charmbracelet/bubbletea"

	"github.com/kubiks-inc/kubiks-cli/pkg/types"
)

// Model represents the state of our application
type Model struct {
	commands    []types.Command
	cursor      int
	executing   bool
	lastOutput  string
	lastError   error
	showingHelp bool
	currentCmd  *exec.Cmd
	styles      *Styles
}

// NewModel creates a new UI model
func NewModel(commands []types.Command) *Model {
	return &Model{
		commands:    commands,
		cursor:      0,
		executing:   false,
		showingHelp: false,
		styles:      NewStyles(),
	}
}

// Init is called when the program starts
func (m *Model) Init() tea.Cmd {
	return nil
}

// killChildProcess kills the current running command and its child processes
func (m *Model) killChildProcess() {
	if m.currentCmd != nil {
		killProcessGroup(m.currentCmd)
		m.currentCmd = nil
	}
}

// Update handles messages and updates the model
func (m *Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
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
				return m, m.commands[m.cursor].Action()
			}
		case "h", "?":
			m.showingHelp = !m.showingHelp
		case "c":
			// Clear last output
			m.lastOutput = ""
			m.lastError = nil
		}

	case types.ExecMsg:
		m.executing = true
		m.currentCmd = msg.Cmd

		// Set up signal handling for the child process
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

		// Handle signals in a goroutine
		go func() {
			<-sigChan
			killProcessGroup(msg.Cmd)
		}()

		// Use tea.ExecProcess to suspend the UI and run the command
		return m, tea.ExecProcess(msg.Cmd, func(err error) tea.Msg {
			// Stop signal notifications for this command
			signal.Stop(sigChan)
			close(sigChan)
			return types.CommandExecutedMsg{
				Output: "",
				Err:    err,
			}
		})

	case types.CommandExecutedMsg:
		m.executing = false
		m.lastOutput = msg.Output
		m.lastError = msg.Err
		m.currentCmd = nil
	}

	return m, nil
}

// View renders the UI
func (m *Model) View() string {
	var s strings.Builder

	// Title
	s.WriteString(m.styles.Title.Render("Kubiks CLI"))
	s.WriteString("\n\n")

	if m.executing {
		s.WriteString("🔄 Command is running (output is printed above)...\n\n")
		s.WriteString(m.styles.Help.Render("Press q or ctrl+c to stop and quit"))
		return s.String()
	}

	// Commands menu
	s.WriteString("Available Commands:\n\n")
	for i, cmd := range m.commands {
		cursor := "  "
		style := m.styles.Unselected

		if m.cursor == i {
			cursor = "▶ "
			style = m.styles.Selected
		}

		s.WriteString(cursor)
		s.WriteString(style.Render(cmd.Name))
		s.WriteString(" - ")
		s.WriteString(cmd.Description)
		s.WriteString("\n")
	}

	// Show command output if there was an execution
	if m.lastOutput != "" || m.lastError != nil {
		s.WriteString("\n")
		s.WriteString("Last Command Result:\n")

		if m.lastError != nil {
			s.WriteString(m.styles.Error.Render(fmt.Sprintf("❌ Error: %v", m.lastError)))
			s.WriteString("\n")
			if m.lastOutput != "" {
				s.WriteString(m.styles.Error.Render("Output:"))
				s.WriteString("\n")
				s.WriteString(m.lastOutput)
			}
		} else {
			s.WriteString(m.styles.Success.Render("✅ Command executed successfully"))
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
		s.WriteString(m.styles.Help.Render("Help:"))
		s.WriteString("\n")
		s.WriteString(m.styles.Help.Render("↑/k: Move up"))
		s.WriteString("\n")
		s.WriteString(m.styles.Help.Render("↓/j: Move down"))
		s.WriteString("\n")
		s.WriteString(m.styles.Help.Render("Enter/Space: Execute command"))
		s.WriteString("\n")
		s.WriteString(m.styles.Help.Render("h/?: Toggle help"))
		s.WriteString("\n")
		s.WriteString(m.styles.Help.Render("c: Clear last output"))
		s.WriteString("\n")
		s.WriteString(m.styles.Help.Render("q/Ctrl+C/Esc: Quit"))
		s.WriteString("\n")
	}

	// Footer
	s.WriteString("\n")
	if m.showingHelp {
		s.WriteString(m.styles.Help.Render("Press h or ? to hide help • Press q to quit"))
	} else {
		s.WriteString(m.styles.Help.Render("Press ↑/↓ to navigate • Enter to execute • h for help • q to quit"))
	}

	return s.String()
}