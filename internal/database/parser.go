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
			if serviceName := extractServiceNameFromAttributes(resource["attributes"]); serviceName != "" {
				return serviceName
			}
		}

		// Also support flattened payloads where resource attributes are at top-level under "resourceAttributes"
		if serviceName := extractServiceNameFromAttributes(v["resourceAttributes"]); serviceName != "" {
			return serviceName
		}

		// Check for direct attributes (could be at any level)
		if serviceName := extractServiceNameFromAttributes(v["attributes"]); serviceName != "" {
			return serviceName
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

		// Check for scopeLogs/scopeMetrics and their nested records
		for _, key := range []string{"scopeLogs", "scopeMetrics", "scopeSpans"} {
			if scopes, ok := v[key].([]interface{}); ok {
				for _, scope := range scopes {
					if serviceName := findServiceName(scope); serviceName != "" {
						return serviceName
					}
				}
			}
		}

		// Check for log/metric/span records arrays
		for _, key := range []string{"logRecords", "metricRecords", "spans"} {
			if records, ok := v[key].([]interface{}); ok {
				for _, record := range records {
					if serviceName := findServiceName(record); serviceName != "" {
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

// extractServiceNameFromAttributes handles both map and array formats for OTEL attributes
func extractServiceNameFromAttributes(attributes interface{}) string {
	switch attrs := attributes.(type) {
	case map[string]interface{}:
		// Map format: {"service.name": "my-service"}
		if serviceName, ok := attrs["service.name"].(string); ok && serviceName != "" {
			return serviceName
		}
		if serviceName, ok := attrs["service_name"].(string); ok && serviceName != "" {
			return serviceName
		}

	case []interface{}:
		// Array format: [{"key": "service.name", "value": {"stringValue": "my-service"}}]
		for _, attr := range attrs {
			if attrMap, ok := attr.(map[string]interface{}); ok {
				if key, ok := attrMap["key"].(string); ok && (key == "service.name" || key == "service_name") {
					if value, ok := attrMap["value"].(map[string]interface{}); ok {
						// Check for stringValue
						if stringValue, ok := value["stringValue"].(string); ok && stringValue != "" {
							return stringValue
						}
					}
				}
			}
		}
	}

	return ""
}
