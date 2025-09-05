package executor

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/kubiks-inc/kubiks-cli/internal/database"
	"github.com/kubiks-inc/kubiks-cli/pkg/types"
)

// NextJSExecutor handles execution of Next.js applications with OpenTelemetry environment configuration
type NextJSExecutor struct {
	// No instrumentation path needed anymore
}

// NewNextJSExecutor creates a new Next.js executor
func NewNextJSExecutor() (*NextJSExecutor, error) {
	return &NextJSExecutor{}, nil
}

// RunDirect runs the Next.js development server directly without TUI wrapper
func (e *NextJSExecutor) RunDirect() error {
	// Pre-validate the environment
	if err := e.validateEnvironment(); err != nil {
		return err
	}

	serviceName := e.getServiceNameFromPackageJSON()
	fmt.Println("🚀 Starting Next.js development server with OpenTelemetry environment configuration...")
	fmt.Printf("🏷️  Service name: %s\n", serviceName)

	// Resolve base, traces endpoint and protocol from project .env files
	resolvedBase, resolvedTraces, resolvedProtocol := e.resolveExporterConfig()
	fmt.Printf("🔗 Local OTEL Endpoint: http://localhost:7432/v1/traces\n")
	fmt.Printf("📡 OTEL Protocol: %s\n", resolvedProtocol)
	if resolvedTraces != "" && !strings.Contains(resolvedTraces, ":7432/") {
		fmt.Printf("🔁 Remote mirror target: %s\n", resolvedTraces)
	}

	// Resolve logs forwarding configuration
	logsCfg := e.resolveLogsForwardingConfig(resolvedBase, resolvedTraces)
	if logsCfg.endpoint != "" {
		fmt.Printf("📝 OTEL Logs Endpoint: %s\n", logsCfg.endpoint)
		if logsCfg.protocol != "http/json" {
			fmt.Println("⚠️  Logs forwarding only supports http/json. Skipping remote logs forwarding.")
			logsCfg.enabled = false
		}
	}

	// Warn if using an external collector (non-localhost)
	if u, err := url.Parse(resolvedTraces); err == nil {
		host := u.Hostname()
		if host != "localhost" && host != "127.0.0.1" && host != "" {
			fmt.Println("⚠️  Using external collector; local Kubiks UI will not display remote spans unless the data is also ingested locally.")
		}
	}

	// Warn if endpoint likely missing OTLP HTTP path
	if !strings.Contains(resolvedTraces, "/v1/") {
		fmt.Println("⚠️  The OTEL endpoint may be missing the OTLP HTTP path. Example: http://host:4318/v1/traces")
	}

	cmd, err := e.createCommand()
	if err != nil {
		return err
	}

	// Intercept stdout/stderr so we can mirror to console and store raw lines in DB
	cmd.Stdin = os.Stdin
	stdoutPipe, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("failed to get stdout pipe: %w", err)
	}
	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("failed to get stderr pipe: %w", err)
	}

	// Open the shared database to store raw log lines
	db, err := database.NewDB(types.GetDatabasePath())
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	// Set up signal handling for graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Start the command
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start command: %w", err)
	}

	// Render a simple banner with the Web Interface URL
	fmt.Println()
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Println(" Kubiks Dev is running")
	fmt.Println()
	fmt.Println(" Web Interface:")
	fmt.Println("  • http://localhost:7431")
	fmt.Println()
	fmt.Println(" Press Ctrl+C to stop.")
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

	// Handle signals and command completion concurrently
	go func() {
		<-sigChan
		fmt.Println("\n🛑 Shutting down Next.js development server...")

		// Kill the entire process group to ensure all child processes are terminated
		if err := killProcessGroup(cmd.Process.Pid); err != nil {
			fmt.Printf("Warning: failed to kill process group: %v\n", err)
		}
	}()

	// Start goroutines to read and persist stdout/stderr lines
	var forwardChan chan map[string]interface{}
	if logsCfg.enabled {
		forwardChan = make(chan map[string]interface{}, 200)
		go e.startLogsForwarder(forwardChan, logsCfg)
	}
	writeRawLog := func(line, stream string) {
		// Mirror to console first
		if stream == "STDERR" {
			fmt.Fprintln(os.Stderr, line)
		} else {
			fmt.Fprintln(os.Stdout, line)
		}

		// Build a minimal JSON log record without parsing the line contents
		logRecord := map[string]interface{}{
			"timeUnixNano":       strconv.FormatInt(time.Now().UnixNano(), 10),
			"severityText":       stream,
			"severityNumber":     0,
			"body":               line,
			"attributes":         map[string]interface{}{},
			"resourceAttributes": map[string]interface{}{"service.name": serviceName},
		}
		bytes, mErr := json.Marshal(logRecord)
		if mErr != nil {
			return
		}
		// Store with unknown trace ID; service name will be extracted from resourceAttributes
		_, _ = db.InsertLog("unknown", string(bytes))

		// Forward to remote OTLP logs endpoint if enabled
		if logsCfg.enabled {
			select {
			case forwardChan <- logRecord:
			default:
				// drop if buffer full
			}
		}
	}

	go func() {
		scanner := bufio.NewScanner(stdoutPipe)
		scanner.Buffer(make([]byte, 0, 1024), 1024*1024)
		for scanner.Scan() {
			writeRawLog(scanner.Text(), "STDOUT")
		}
	}()
	go func() {
		scanner := bufio.NewScanner(stderrPipe)
		scanner.Buffer(make([]byte, 0, 1024), 1024*1024)
		for scanner.Scan() {
			writeRawLog(scanner.Text(), "STDERR")
		}
	}()

	// Wait for the command to complete
	err = cmd.Wait()

	// Stop listening for signals
	signal.Stop(sigChan)
	close(sigChan)

	return err
}

// createCommand creates the exec.Cmd with proper OpenTelemetry environment variables
func (e *NextJSExecutor) createCommand() (*exec.Cmd, error) {
	// Create the command
	cmd := exec.Command("npm", "run", "dev")

	// Get current environment
	env := os.Environ()

	// Resolve exporter configuration (from .env files) and set env vars
	base, tracesEndpoint, protocol := e.resolveExporterConfig()

	// Set OpenTelemetry environment variables
	env = append(env, "OTEL_EXPORTER_OTLP_ENDPOINT="+base)
	// Always send traces to local collector to ensure local DB path is permanent
	env = append(env, "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:7432/v1/traces")
	env = append(env, "OTEL_EXPORTER_OTLP_PROTOCOL="+protocol)

	// If logs endpoint configured, set it for the child process as well
	logsCfg := e.resolveLogsForwardingConfig(base, tracesEndpoint)
	if logsCfg.endpoint != "" {
		env = append(env, "OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="+logsCfg.endpoint)
		if logsCfg.headers != "" {
			env = append(env, "OTEL_EXPORTER_OTLP_HEADERS="+logsCfg.headers)
		}
	}

	// Ensure service name is set for traces if not provided by the user
	// Prefer existing OS env or .env values; otherwise use package.json name
	if _, ok := os.LookupEnv("OTEL_SERVICE_NAME"); !ok {
		vals := e.loadDotEnvFiles([]string{".env.local", ".env"})
		if _, exists := vals["OTEL_SERVICE_NAME"]; !exists {
			serviceName := e.getServiceNameFromPackageJSON()
			env = append(env, "OTEL_SERVICE_NAME="+serviceName)
		}
	}

	// Also ensure OTEL_RESOURCE_ATTRIBUTES has service.name, which some SDKs honor
	{
		vals := e.loadDotEnvFiles([]string{".env.local", ".env"})
		osVal, hasOS := os.LookupEnv("OTEL_RESOURCE_ATTRIBUTES")
		dotVal := vals["OTEL_RESOURCE_ATTRIBUTES"]
		existing := osVal
		if !hasOS {
			existing = dotVal
		}
		if !strings.Contains(existing, "service.name=") {
			serviceName := e.getServiceNameFromPackageJSON()
			env = append(env, "OTEL_RESOURCE_ATTRIBUTES=service.name="+serviceName)
		}
	}

	// Best-effort: set Vercel-specific env if absent, to influence @vercel/otel's default name
	if _, ok := os.LookupEnv("VERCEL_OTEL_SERVICE_NAME"); !ok {
		vals := e.loadDotEnvFiles([]string{".env.local", ".env"})
		if _, exists := vals["VERCEL_OTEL_SERVICE_NAME"]; !exists {
			serviceName := e.getServiceNameFromPackageJSON()
			env = append(env, "VERCEL_OTEL_SERVICE_NAME="+serviceName)
		}
	}

	// Optional: force single-line JSON console output via preload when enabled
	{
		vals := e.loadDotEnvFiles([]string{".env.local", ".env"})
		flag := strings.ToLower(strings.TrimSpace(vals["KUBIKS_LOGS_SINGLE_LINE_JSON"]))
		if flag == "1" || flag == "true" || flag == "yes" || flag == "on" {
			serviceName := e.getServiceNameFromPackageJSON()
			if preloadPath, err := e.createConsoleJSONPreload(serviceName); err == nil && preloadPath != "" {
				// Merge with existing NODE_OPTIONS
				existing := os.Getenv("NODE_OPTIONS")
				newVal := strings.TrimSpace(strings.Join([]string{existing, "--require", preloadPath}, " "))
				if existing == "" {
					newVal = strings.Join([]string{"--require", preloadPath}, " ")
				}
				env = append(env, "NODE_OPTIONS="+newVal)
			}
		}
	}

	cmd.Env = env

	// Set working directory to current directory
	cmd.Dir, _ = os.Getwd()

	// Set platform-specific process attributes
	configurePlatformSpecific(cmd)

	return cmd, nil
}

// validateEnvironment checks for common issues before running the command
func (e *NextJSExecutor) validateEnvironment() error {
	// Check if we're in a directory with package.json
	if _, err := os.Stat("package.json"); os.IsNotExist(err) {
		return fmt.Errorf("package.json not found in current directory. Please run this command from a Next.js project root")
	}

	// Check if npm is available
	if _, err := exec.LookPath("npm"); err != nil {
		return fmt.Errorf("npm not found in PATH. Please install Node.js and npm")
	}

	// Check if node_modules exists
	if _, err := os.Stat("node_modules"); os.IsNotExist(err) {
		return fmt.Errorf("node_modules not found. Please run 'npm install' first")
	}

	return nil
}

// getServiceNameFromPackageJSON reads the service name from package.json
func (e *NextJSExecutor) getServiceNameFromPackageJSON() string {
	type PackageJSON struct {
		Name string `json:"name"`
	}

	packageJSONPath := filepath.Join(".", "package.json")
	data, err := os.ReadFile(packageJSONPath)
	if err != nil {
		fmt.Printf("⚠️  Warning: Could not read package.json: %v, using directory name\n", err)
		// Fallback to directory name
		currentDir, _ := os.Getwd()
		return filepath.Base(currentDir)
	}

	var pkg PackageJSON
	if err := json.Unmarshal(data, &pkg); err != nil {
		fmt.Printf("⚠️  Warning: Could not parse package.json: %v, using directory name\n", err)
		// Fallback to directory name
		currentDir, _ := os.Getwd()
		return filepath.Base(currentDir)
	}

	if pkg.Name == "" {
		fmt.Printf("⚠️  Warning: package.json has no name field, using directory name\n")
		// Fallback to directory name
		currentDir, _ := os.Getwd()
		return filepath.Base(currentDir)
	}

	fmt.Printf("📦 Using service name from package.json: %s\n", pkg.Name)
	return pkg.Name
}

// resolveExporterConfig returns the OTLP exporter endpoint and protocol.
// Precedence (first match wins): .env.local, then .env. Fallbacks to local collector.
func (e *NextJSExecutor) resolveExporterConfig() (string, string, string) {
	defaultBase := "http://localhost:7432"
	defaultProtocol := "http/json"

	vals := e.loadDotEnvFiles([]string{".env.local", ".env"})

	// Base endpoint
	base := vals["OTEL_EXPORTER_OTLP_ENDPOINT"]
	if base == "" {
		base = defaultBase
	}

	// Traces endpoint (override or derived from base)
	traces := vals["OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"]
	if traces == "" {
		traces = normalizeOTLPEndpoint(base, "traces")
	} else {
		traces = normalizeOTLPEndpoint(traces, "traces")
	}

	// Protocol
	protocol := vals["OTEL_EXPORTER_OTLP_PROTOCOL"]
	if protocol == "" {
		protocol = defaultProtocol
	}

	return base, traces, protocol
}

// loadDotEnvFiles parses simple KEY=VALUE lines from the provided files in order.
// Earlier files take precedence (do not get overridden by later files).
func (e *NextJSExecutor) loadDotEnvFiles(files []string) map[string]string {
	values := make(map[string]string)

	setIfEmpty := func(k, v string) {
		if k == "" || v == "" {
			return
		}
		if _, exists := values[k]; !exists {
			values[k] = v
		}
	}

	for _, name := range files {
		data, err := os.ReadFile(filepath.Join(".", name))
		if err != nil {
			continue
		}
		lines := strings.Split(string(data), "\n")
		for _, line := range lines {
			line = strings.TrimSpace(line)
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			if strings.HasPrefix(line, "export ") {
				line = strings.TrimSpace(strings.TrimPrefix(line, "export "))
			}
			idx := strings.Index(line, "=")
			if idx <= 0 {
				continue
			}
			k := strings.TrimSpace(line[:idx])
			v := strings.TrimSpace(line[idx+1:])
			if len(v) >= 2 {
				if (strings.HasPrefix(v, "\"") && strings.HasSuffix(v, "\"")) || (strings.HasPrefix(v, "'") && strings.HasSuffix(v, "'")) {
					v = v[1 : len(v)-1]
				}
			}
			setIfEmpty(k, v)
		}
	}

	return values
}

// logsForwardingConfig holds settings for forwarding console logs to an OTLP logs endpoint
type logsForwardingConfig struct {
	enabled  bool
	endpoint string
	headers  string
	protocol string
}

// resolveLogsForwardingConfig determines if logs forwarding is enabled and returns config.
// Rules:
//   - If OTEL_EXPORTER_OTLP_LOGS_ENDPOINT provided in .env, use it
//   - Else, if the traces endpoint is local kubiks, disable forwarding by default
//   - Else, if the traces endpoint is remote and uses http/json, reuse it for logs
//   - Headers may be set via OTEL_EXPORTER_OTLP_HEADERS
func (e *NextJSExecutor) resolveLogsForwardingConfig(baseEndpoint string, tracesEndpoint string) logsForwardingConfig {
	vals := e.loadDotEnvFiles([]string{".env.local", ".env"})
	cfg := logsForwardingConfig{
		enabled:  false,
		endpoint: "",
		headers:  vals["OTEL_EXPORTER_OTLP_HEADERS"],
		protocol: vals["OTEL_EXPORTER_OTLP_PROTOCOL"],
	}

	// Highest priority: explicit logs endpoint
	if v := vals["OTEL_EXPORTER_OTLP_LOGS_ENDPOINT"]; v != "" {
		cfg.endpoint = normalizeOTLPEndpoint(v, "logs")
		cfg.enabled = true
		if cfg.protocol == "" {
			cfg.protocol = "http/json"
		}
		return cfg
	}

	// If traces endpoint points to local kubiks, do not forward by default
	if strings.Contains(tracesEndpoint, ":7432/") || strings.Contains(tracesEndpoint, "localhost:7432/") {
		return cfg
	}

	// Otherwise, reuse traces endpoint for logs if protocol is http/json
	if cfg.protocol == "" {
		cfg.protocol = "http/json"
	}
	if cfg.protocol == "http/json" {
		// Traces endpoint may be a base or already normalized; derive logs path accordingly
		if strings.Contains(tracesEndpoint, "/v1/traces") {
			cfg.endpoint = strings.Replace(tracesEndpoint, "/v1/traces", "/v1/logs", 1)
		} else {
			cfg.endpoint = normalizeOTLPEndpoint(baseEndpoint, "logs")
		}
		cfg.enabled = true
	}
	return cfg
}

// startLogsForwarder reads records and ships them to the OTLP logs endpoint using OTLP HTTP JSON
func (e *NextJSExecutor) startLogsForwarder(ch <-chan map[string]interface{}, cfg logsForwardingConfig) {
	client := &http.Client{Timeout: 5 * time.Second}
	batch := make([]map[string]interface{}, 0, 50)
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	flush := func() {
		if len(batch) == 0 {
			return
		}
		payload := buildOTLPLogsJSONPayload(batch)
		body, _ := json.Marshal(payload)
		req, err := http.NewRequest("POST", cfg.endpoint, bytes.NewReader(body))
		if err == nil {
			req.Header.Set("Content-Type", "application/json")
			if cfg.headers != "" {
				// headers like "k1=v1,k2=v2"
				for _, kv := range strings.Split(cfg.headers, ",") {
					kv = strings.TrimSpace(kv)
					if kv == "" {
						continue
					}
					parts := strings.SplitN(kv, "=", 2)
					if len(parts) == 2 {
						req.Header.Set(parts[0], parts[1])
					}
				}
			}
			_, _ = client.Do(req)
		}
		batch = batch[:0]
	}

	for {
		select {
		case rec, ok := <-ch:
			if !ok {
				flush()
				return
			}
			batch = append(batch, rec)
			if len(batch) >= 50 {
				flush()
			}
		case <-ticker.C:
			flush()
		}
	}
}

// buildOTLPLogsJSONPayload wraps flat log records into minimal OTLP HTTP JSON structure
func buildOTLPLogsJSONPayload(recs []map[string]interface{}) map[string]interface{} {
	// Convert map -> KeyValue[] per OTLP
	buildKeyValue := func(m map[string]interface{}) []map[string]interface{} {
		kv := make([]map[string]interface{}, 0, len(m))
		for k, v := range m {
			kv = append(kv, map[string]interface{}{"key": k, "value": anyValue(v)})
		}
		return kv
	}

	// Lift resourceAttributes to resource.attributes once per batch
	var resourceAttrs []map[string]interface{}
	if len(recs) > 0 {
		if ra, ok := recs[0]["resourceAttributes"].(map[string]interface{}); ok {
			resourceAttrs = buildKeyValue(ra)
		}
	}

	// Convert each record
	logRecords := make([]map[string]interface{}, 0, len(recs))
	for _, r := range recs {
		var attrs []map[string]interface{}
		if am, ok := r["attributes"].(map[string]interface{}); ok {
			attrs = buildKeyValue(am)
		}
		var body map[string]interface{}
		if b, ok := r["body"]; ok {
			body = anyValue(b)
		}
		logRecords = append(logRecords, map[string]interface{}{
			"timeUnixNano":         r["timeUnixNano"],
			"observedTimeUnixNano": r["observedTimeUnixNano"],
			"severityText":         r["severityText"],
			"severityNumber":       r["severityNumber"],
			"body":                 body,
			"attributes":           attrs,
		})
	}

	payload := map[string]interface{}{
		"resourceLogs": []map[string]interface{}{
			{
				"resource": map[string]interface{}{
					"attributes": resourceAttrs,
				},
				"scopeLogs": []map[string]interface{}{
					{
						"scope":      map[string]interface{}{},
						"logRecords": logRecords,
					},
				},
			},
		},
	}
	return payload
}

// anyValue converts a value to OTLP AnyValue JSON
func anyValue(v interface{}) map[string]interface{} {
	switch t := v.(type) {
	case string:
		return map[string]interface{}{"stringValue": t}
	case bool:
		return map[string]interface{}{"boolValue": t}
	case float64:
		return map[string]interface{}{"doubleValue": t}
	case float32:
		return map[string]interface{}{"doubleValue": float64(t)}
	case int, int8, int16, int32, int64, uint, uint8, uint16, uint32, uint64:
		return map[string]interface{}{"intValue": fmt.Sprintf("%v", v)}
	case map[string]interface{}:
		// If already AnyValue-like, pass through
		if _, ok := t["stringValue"]; ok {
			return t
		}
		if _, ok := t["boolValue"]; ok {
			return t
		}
		if _, ok := t["doubleValue"]; ok {
			return t
		}
		if _, ok := t["intValue"]; ok {
			return t
		}
		if _, ok := t["bytesValue"]; ok {
			return t
		}
		b, _ := json.Marshal(t)
		return map[string]interface{}{"stringValue": string(b)}
	default:
		return map[string]interface{}{"stringValue": fmt.Sprintf("%v", v)}
	}
}

// normalizeOTLPEndpoint appends the OTLP HTTP signal path when the endpoint is a base URL
// signal should be "traces" or "logs"
func normalizeOTLPEndpoint(raw string, signal string) string {
	u, err := url.Parse(raw)
	if err != nil {
		return raw
	}
	path := u.Path
	if signal != "traces" && signal != "logs" {
		signal = "traces"
	}
	// Already correct
	if strings.HasSuffix(path, "/v1/"+signal) {
		return raw
	}
	// If base or "/" -> add /v1/<signal>
	if path == "" || path == "/" {
		u.Path = "/v1/" + signal
		return u.String()
	}
	// If exactly /v1 or /v1/ -> add <signal>
	if path == "/v1" || path == "/v1/" {
		u.Path = "/v1/" + signal
		return u.String()
	}
	// If contains /v1 but not a signal, best-effort append
	if strings.HasPrefix(path, "/v1/") && !strings.Contains(path, "/v1/traces") && !strings.Contains(path, "/v1/logs") {
		if strings.HasSuffix(path, "/") {
			u.Path = path + signal
		} else {
			u.Path = path + "/" + signal
		}
		return u.String()
	}
	return raw
}

// createConsoleJSONPreload writes a Node preload script that forces console methods to emit single-line JSON
func (e *NextJSExecutor) createConsoleJSONPreload(serviceName string) (string, error) {
	cwd, _ := os.Getwd()
	baseDir := filepath.Join(cwd, ".kubiks")
	_ = os.MkdirAll(baseDir, 0o755)
	preloadPath := filepath.Join(baseDir, "console-json-preload.js")
	content := `;(function(){
  try {
    const LEVELS = { log: "INFO", info: "INFO", warn: "WARN", error: "ERROR", debug: "DEBUG" };
    const original = { log: console.log, info: console.info, warn: console.warn, error: console.error, debug: console.debug };
    function toStringSafe(v){
      try {
        if (typeof v === 'string') return v;
        return JSON.stringify(v);
      } catch (_) {
        try { return String(v); } catch { return '[unprintable]'; }
      }
    }
    function format(level, args){
      const msg = args.map(toStringSafe).join(' ');
      const rec = {
        time: new Date().toISOString(),
        level,
        service: ` + "`" + serviceName + "`" + `,
        message: msg
      };
      return JSON.stringify(rec);
    }
    for (const name of Object.keys(original)){
      console[name] = (...args) => {
        const lvl = LEVELS[name] || name.toUpperCase();
        original[name](format(lvl, args));
      };
    }
  } catch (e) { /* ignore */ }
})();
`
	if err := os.WriteFile(preloadPath, []byte(content), 0o644); err != nil {
		return "", err
	}
	return preloadPath, nil
}
