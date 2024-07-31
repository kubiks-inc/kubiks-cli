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

// ExtractServiceName tries to extract the service name from the OTEL payload
// Returns "unknown" if no service name can be found
func ExtractServiceName(payload []byte) string {
	var data map[string]interface{}
	if err := json.Unmarshal(payload, &data); err != nil {
		return "unknown"
	}

	// Try to find service name in various common locations in OTEL payloads
	serviceName := findServiceName(data)
	if serviceName != "" {
		return serviceName
	}

	return "unknown"
}

// findServiceName recursively searches for service names in the JSON structure
func findServiceName(data interface{}) string {
	switch v := data.(type) {
	case map[string]interface{}:
		// Check for resource attributes first (most common location)
		if resource, ok := v["resource"].(map[string]interface{}); ok {
			if attrs, ok := resource["attributes"].(map[string]interface{}); ok {
				// Check for service.name attribute
				if serviceName, ok := attrs["service.name"].(string); ok && serviceName != "" {
					return serviceName
				}
				// Check for service_name attribute (alternative format)
				if serviceName, ok := attrs["service_name"].(string); ok && serviceName != "" {
					return serviceName
				}
			}
		}

		// Check for nested structures (resourceLogs, resourceMetrics, resourceSpans)
		for _, key := range []string{"resourceLogs", "resourceMetrics", "resourceSpans"} {
			if resources, ok := v[key].([]interface{}); ok {
				for _, resource := range resources {
					if serviceName := findServiceName(resource); serviceName != "" {
						return serviceName
					}
				}
			}
		}

		// Recursively search in nested objects
		for _, value := range v {
			if serviceName := findServiceName(value); serviceName != "" {
				return serviceName
			}
		}

	case []interface{}:
		// Search in arrays
		for _, item := range v {
			if serviceName := findServiceName(item); serviceName != "" {
				return serviceName
			}
		}
	}

	return ""
}
