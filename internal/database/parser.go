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

// ValidateJSON checks if the payload is valid JSON
func ValidateJSON(payload []byte) error {
	var js json.RawMessage
	return json.Unmarshal(payload, &js)
}

// PrettyPrintJSON formats JSON for better readability
func PrettyPrintJSON(payload []byte) (string, error) {
	var obj interface{}
	if err := json.Unmarshal(payload, &obj); err != nil {
		return string(payload), err
	}
	
	pretty, err := json.MarshalIndent(obj, "", "  ")
	if err != nil {
		return string(payload), err
	}
	
	return string(pretty), nil
}

// ExtractServiceName tries to extract service name from OTEL payload
func ExtractServiceName(payload []byte) string {
	var data map[string]interface{}
	if err := json.Unmarshal(payload, &data); err != nil {
		return "unknown"
	}

	serviceName := findServiceName(data)
	if serviceName != "" {
		return serviceName
	}

	return "unknown"
}

// findServiceName recursively searches for service name in the JSON structure
func findServiceName(data interface{}) string {
	switch v := data.(type) {
	case map[string]interface{}:
		// Look for service.name in attributes
		if attrs, ok := v["attributes"].([]interface{}); ok {
			for _, attr := range attrs {
				if attrMap, ok := attr.(map[string]interface{}); ok {
					if key, ok := attrMap["key"].(string); ok && key == "service.name" {
						if value, ok := attrMap["value"].(map[string]interface{}); ok {
							if serviceName, ok := value["stringValue"].(string); ok {
								return serviceName
							}
						}
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