package ui

import "github.com/charmbracelet/lipgloss"

// Styles contains all UI styling definitions
type Styles struct {
	Title       lipgloss.Style
	Selected    lipgloss.Style
	Command     lipgloss.Style
	Unselected  lipgloss.Style
	Help        lipgloss.Style
	Error       lipgloss.Style
	Success     lipgloss.Style
}

// NewStyles creates a new set of UI styles
func NewStyles() *Styles {
	return &Styles{
		Title: lipgloss.NewStyle().
			Foreground(lipgloss.Color("#FAFAFA")).
			Background(lipgloss.Color("#7D56F4")).
			Padding(0, 1).
			Bold(true),

		Selected: lipgloss.NewStyle().
			Foreground(lipgloss.Color("#FAFAFA")).
			Background(lipgloss.Color("#04B575")).
			Padding(0, 1).
			Bold(true),

		Command: lipgloss.NewStyle().
			Foreground(lipgloss.Color("#04B575")).
			Margin(0, 1),

		Unselected: lipgloss.NewStyle().
			Foreground(lipgloss.Color("#626262")).
			Margin(0, 1),

		Help: lipgloss.NewStyle().
			Foreground(lipgloss.Color("#626262")).
			Margin(1, 0),

		Error: lipgloss.NewStyle().
			Foreground(lipgloss.Color("#FF5F87")).
			Bold(true).
			Margin(1, 0),

		Success: lipgloss.NewStyle().
			Foreground(lipgloss.Color("#04B575")).
			Bold(true).
			Margin(1, 0),
	}
}