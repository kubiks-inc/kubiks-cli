package database

import (
	"testing"
)

func TestExtractTraceID(t *testing.T) {
	tests := []struct {
		name     string
		payload  string
		expected string
	}{
		{
			name:     "trace ID in traceId field",
			payload:  `{"traceId": "abc123def456"}`,
			expected: "abc123def456",
		},
		{
			name:     "trace ID in trace_id field",
			payload:  `{"trace_id": "xyz789uvw012"}`,
			expected: "xyz789uvw012",
		},
		{
			name: "trace ID in nested structure",
			payload: `{
				"spans": [
					{
						"traceId": "nested123",
						"spanId": "span456"
					}
				]
			}`,
			expected: "nested123",
		},
		{
			name: "trace ID in OTEL log format",
			payload: `{
				"resourceLogs": [
					{
						"scopeLogs": [
							{
								"logRecords": [
									{
										"traceId": "otel-log-trace-123"
									}
								]
							}
						]
					}
				]
			}`,
			expected: "otel-log-trace-123",
		},
		{
			name: "trace ID in OTEL span format",
			payload: `{
				"resourceSpans": [
					{
						"scopeSpans": [
							{
								"spans": [
									{
										"traceId": "otel-span-trace-456",
										"spanId": "span-789"
									}
								]
							}
						]
					}
				]
			}`,
			expected: "otel-span-trace-456",
		},
		{
			name:     "no trace ID found",
			payload:  `{"spanId": "span123", "data": "some data"}`,
			expected: "unknown",
		},
		{
			name:     "empty trace ID",
			payload:  `{"traceId": "", "spanId": "span123"}`,
			expected: "unknown",
		},
		{
			name:     "invalid JSON",
			payload:  `{"traceId": "incomplete`,
			expected: "unknown",
		},
		{
			name:     "empty payload",
			payload:  ``,
			expected: "unknown",
		},
		{
			name: "multiple trace IDs - returns first found",
			payload: `{
				"firstTraceId": "first-trace",
				"secondTraceId": "second-trace"
			}`,
			expected: "unknown", // Neither matches exact field names
		},
		{
			name: "trace ID in array with multiple items",
			payload: `{
				"traces": [
					{"spanId": "span1"},
					{"traceId": "array-trace-123"},
					{"traceId": "array-trace-456"}
				]
			}`,
			expected: "array-trace-123",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ExtractTraceID([]byte(tt.payload))
			if result != tt.expected {
				t.Errorf("ExtractTraceID() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestExtractServiceName(t *testing.T) {
	tests := []struct {
		name     string
		payload  string
		expected string
	}{
		{
			name: "service name in resource attributes (map format)",
			payload: `{
				"resource": {
					"attributes": {
						"service.name": "my-test-service"
					}
				}
			}`,
			expected: "my-test-service",
		},
		{
			name: "service name in resource attributes (array format)",
			payload: `{
				"resource": {
					"attributes": [
						{
							"key": "service.name",
							"value": {
								"stringValue": "array-format-service"
							}
						}
					]
				}
			}`,
			expected: "array-format-service",
		},
		{
			name: "service name with underscore variant",
			payload: `{
				"resource": {
					"attributes": {
						"service_name": "underscore-service"
					}
				}
			}`,
			expected: "underscore-service",
		},
		{
			name: "service name in OTEL logs format",
			payload: `{
				"resourceLogs": [
					{
						"resource": {
							"attributes": [
								{
									"key": "service.name",
									"value": {
										"stringValue": "otel-logs-service"
									}
								}
							]
						}
					}
				]
			}`,
			expected: "otel-logs-service",
		},
		{
			name: "service name in OTEL metrics format",
			payload: `{
				"resourceMetrics": [
					{
						"resource": {
							"attributes": [
								{
									"key": "service.name",
									"value": {
										"stringValue": "otel-metrics-service"
									}
								}
							]
						}
					}
				]
			}`,
			expected: "otel-metrics-service",
		},
		{
			name: "service name in OTEL spans format",
			payload: `{
				"resourceSpans": [
					{
						"resource": {
							"attributes": [
								{
									"key": "service.name",
									"value": {
										"stringValue": "otel-spans-service"
									}
								}
							]
						}
					}
				]
			}`,
			expected: "otel-spans-service",
		},
		{
			name: "service name in scope logs",
			payload: `{
				"resourceLogs": [
					{
						"scopeLogs": [
							{
								"logRecords": [
									{
										"attributes": [
											{
												"key": "service.name",
												"value": {
													"stringValue": "scope-logs-service"
												}
											}
										]
									}
								]
							}
						]
					}
				]
			}`,
			expected: "scope-logs-service",
		},
		{
			name: "service name in direct attributes",
			payload: `{
				"attributes": {
					"service.name": "direct-attributes-service"
				}
			}`,
			expected: "direct-attributes-service",
		},
		{
			name: "complex nested structure with multiple levels",
			payload: `{
				"resourceLogs": [
					{
						"resource": {
							"attributes": [
								{
									"key": "host.name",
									"value": {
										"stringValue": "localhost"
									}
								},
								{
									"key": "service.name",
									"value": {
										"stringValue": "complex-nested-service"
									}
								}
							]
						},
						"scopeLogs": [
							{
								"logRecords": [
									{
										"timeUnixNano": "1609459200000000000",
										"body": {
											"stringValue": "Test log message"
										}
									}
								]
							}
						]
					}
				]
			}`,
			expected: "complex-nested-service",
		},
		{
			name:     "no service name found",
			payload:  `{"traceId": "abc123", "spanId": "def456"}`,
			expected: "unknown",
		},
		{
			name: "empty service name",
			payload: `{
				"resource": {
					"attributes": {
						"service.name": ""
					}
				}
			}`,
			expected: "unknown",
		},
		{
			name:     "invalid JSON",
			payload:  `{"resource": {"attributes": }`,
			expected: "unknown",
		},
		{
			name:     "empty payload",
			payload:  ``,
			expected: "unknown",
		},
		{
			name: "service name in array format with wrong key",
			payload: `{
				"resource": {
					"attributes": [
						{
							"key": "wrong.key",
							"value": {
								"stringValue": "wrong-service"
							}
						}
					]
				}
			}`,
			expected: "unknown",
		},
		{
			name: "service name in array format without stringValue",
			payload: `{
				"resource": {
					"attributes": [
						{
							"key": "service.name",
							"value": {
								"intValue": 123
							}
						}
					]
				}
			}`,
			expected: "unknown",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ExtractServiceName([]byte(tt.payload))
			if result != tt.expected {
				t.Errorf("ExtractServiceName() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestFindTraceID(t *testing.T) {
	tests := []struct {
		name     string
		data     interface{}
		expected string
	}{
		{
			name: "map with traceId",
			data: map[string]interface{}{
				"traceId": "test-trace-123",
			},
			expected: "test-trace-123",
		},
		{
			name: "map with trace_id",
			data: map[string]interface{}{
				"trace_id": "test-trace-456",
			},
			expected: "test-trace-456",
		},
		{
			name: "nested map",
			data: map[string]interface{}{
				"nested": map[string]interface{}{
					"traceId": "nested-trace-789",
				},
			},
			expected: "nested-trace-789",
		},
		{
			name: "array with trace ID",
			data: []interface{}{
				map[string]interface{}{
					"traceId": "array-trace-012",
				},
			},
			expected: "array-trace-012",
		},
		{
			name:     "string value",
			data:     "just-a-string",
			expected: "",
		},
		{
			name:     "nil value",
			data:     nil,
			expected: "",
		},
		{
			name:     "empty map",
			data:     map[string]interface{}{},
			expected: "",
		},
		{
			name:     "empty array",
			data:     []interface{}{},
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := findTraceID(tt.data)
			if result != tt.expected {
				t.Errorf("findTraceID() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestFindServiceName(t *testing.T) {
	tests := []struct {
		name     string
		data     interface{}
		expected string
	}{
		{
			name: "resource with attributes map",
			data: map[string]interface{}{
				"resource": map[string]interface{}{
					"attributes": map[string]interface{}{
						"service.name": "test-service",
					},
				},
			},
			expected: "test-service",
		},
		{
			name: "direct attributes",
			data: map[string]interface{}{
				"attributes": map[string]interface{}{
					"service.name": "direct-service",
				},
			},
			expected: "direct-service",
		},
		{
			name: "resourceLogs structure",
			data: map[string]interface{}{
				"resourceLogs": []interface{}{
					map[string]interface{}{
						"resource": map[string]interface{}{
							"attributes": []interface{}{
								map[string]interface{}{
									"key": "service.name",
									"value": map[string]interface{}{
										"stringValue": "logs-service",
									},
								},
							},
						},
					},
				},
			},
			expected: "logs-service",
		},
		{
			name:     "no service name",
			data:     map[string]interface{}{"other": "data"},
			expected: "",
		},
		{
			name:     "string data",
			data:     "string-data",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := findServiceName(tt.data)
			if result != tt.expected {
				t.Errorf("findServiceName() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestExtractServiceNameFromAttributes(t *testing.T) {
	tests := []struct {
		name     string
		attrs    interface{}
		expected string
	}{
		{
			name: "map format with service.name",
			attrs: map[string]interface{}{
				"service.name": "map-service",
				"other.attr":   "other-value",
			},
			expected: "map-service",
		},
		{
			name: "map format with service_name",
			attrs: map[string]interface{}{
				"service_name": "underscore-service",
			},
			expected: "underscore-service",
		},
		{
			name: "array format with service.name",
			attrs: []interface{}{
				map[string]interface{}{
					"key": "service.name",
					"value": map[string]interface{}{
						"stringValue": "array-service",
					},
				},
			},
			expected: "array-service",
		},
		{
			name: "array format with service_name",
			attrs: []interface{}{
				map[string]interface{}{
					"key": "service_name",
					"value": map[string]interface{}{
						"stringValue": "array-underscore-service",
					},
				},
			},
			expected: "array-underscore-service",
		},
		{
			name: "array format with multiple attributes",
			attrs: []interface{}{
				map[string]interface{}{
					"key": "host.name",
					"value": map[string]interface{}{
						"stringValue": "localhost",
					},
				},
				map[string]interface{}{
					"key": "service.name",
					"value": map[string]interface{}{
						"stringValue": "multi-attr-service",
					},
				},
			},
			expected: "multi-attr-service",
		},
		{
			name: "array format without stringValue",
			attrs: []interface{}{
				map[string]interface{}{
					"key": "service.name",
					"value": map[string]interface{}{
						"intValue": 123,
					},
				},
			},
			expected: "",
		},
		{
			name: "array format with wrong key",
			attrs: []interface{}{
				map[string]interface{}{
					"key": "wrong.key",
					"value": map[string]interface{}{
						"stringValue": "wrong-service",
					},
				},
			},
			expected: "",
		},
		{
			name:     "nil attributes",
			attrs:    nil,
			expected: "",
		},
		{
			name:     "string attributes",
			attrs:    "string-attrs",
			expected: "",
		},
		{
			name:     "empty map",
			attrs:    map[string]interface{}{},
			expected: "",
		},
		{
			name:     "empty array",
			attrs:    []interface{}{},
			expected: "",
		},
		{
			name: "map with empty service name",
			attrs: map[string]interface{}{
				"service.name": "",
			},
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := extractServiceNameFromAttributes(tt.attrs)
			if result != tt.expected {
				t.Errorf("extractServiceNameFromAttributes() = %v, want %v", result, tt.expected)
			}
		})
	}
}
