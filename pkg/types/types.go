package types

// ProjectDetector interface for detecting project types
type ProjectDetector interface {
	IsSupported() (bool, error)
	GetProjectType() string
}