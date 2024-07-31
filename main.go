package main

import (
	"fmt"
	"os"

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

	messageStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#04B575")).
			Bold(true).
			Margin(1, 0)

	helpStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#626262")).
			Margin(1, 0)
)

// model represents the state of our application
type model struct {
	message string
	pressed bool
}

// Init is called when the program starts
func (m model) Init() tea.Cmd {
	return nil
}

// Update handles messages and updates the model
func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q", "esc":
			return m, tea.Quit
		case "enter", " ":
			if !m.pressed {
				m.message = "You pressed a key! 🎉"
				m.pressed = true
			} else {
				m.message = "Thanks for trying Kubiks CLI! 🚀"
			}
		}
	}
	return m, nil
}

// View renders the UI
func (m model) View() string {
	// Build the UI components
	title := titleStyle.Render("Kubiks CLI")
	message := messageStyle.Render(m.message)
	help := helpStyle.Render("Press SPACE or ENTER to interact • Press q/ctrl+c to quit")

	// Combine everything
	return fmt.Sprintf("\n%s\n\n%s\n\n%s\n", title, message, help)
}

// initialModel returns the initial state
func initialModel() model {
	return model{
		message: "Hello, World! Welcome to Kubiks CLI built with Bubble Tea! 🫧",
		pressed: false,
	}
}

func main() {
	// Create a new Bubble Tea program
	p := tea.NewProgram(initialModel())

	// Run the program
	if _, err := p.Run(); err != nil {
		fmt.Printf("Alas, there's been an error: %v", err)
		os.Exit(1)
	}
}
