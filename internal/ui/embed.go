package ui

import (
	"embed"
	"io/fs"
)

// EmbeddedFiles contains the compiled UI assets.
//
//go:embed dist/**
var EmbeddedFiles embed.FS

// DistFS returns an fs.FS rooted at the embedded dist directory.
func DistFS() (fs.FS, error) {
	return fs.Sub(EmbeddedFiles, "dist")
}
