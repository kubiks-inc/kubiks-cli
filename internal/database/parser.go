package database

import (
	"encoding/json"
)

// ExtractTraceID tries to extract a trace ID from the OTEL payload
// Returns "unknown" if no trace ID can be found
func ExtractTraceID(payload []byte) string {
	var data map[string]interface{}
	if err := json.Unmarshal(payload, &data); err != nil {
		return "unknown"
	}

	// Try to find trace ID in various common locations in OTEL payloads
	traceID := findTraceID(data)
	if traceID != "" {
		return traceID
	}

	return "unknown"
}

// findTraceID recursively searches for trace IDs in the JSON structure
func findTraceID(data interface{}) string {
	switch v := data.(type) {
	case map[string]interface{}:
		// Direct trace ID fields
		if traceID, ok := v["traceId"].(string); ok && traceID != "" {
			return traceID
		}
		if traceID, ok := v["trace_id"].(string); ok && traceID != "" {
			return traceID
		}

		// Recursively search in nested objects
		for _, value := range v {
			if traceID := findTraceID(value); traceID != "" {
				return traceID
			}
		}

	case []interface{}:
		// Search in arrays
		for _, item := range v {
			if traceID := findTraceID(item); traceID != "" {
				return traceID
			}
		}
	}

	return ""
}
