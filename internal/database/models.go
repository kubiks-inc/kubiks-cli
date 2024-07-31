package database

import "time"

// OTELRecord represents a simplified OTEL record for any type (logs, metrics, traces)
type OTELRecord struct {
	ID          int64     `json:"id"`
	TraceID     string    `json:"trace_id"`
	ServiceName string    `json:"servicename"`
	Timestamp   time.Time `json:"timestamp"`
	Data        string    `json:"data"` // JSON string of the complete OTEL record
}
