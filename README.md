# Kubiks CLI

[![Tests](https://github.com/kubiks-inc/kubiks-cli/actions/workflows/test.yml/badge.svg)](https://github.com/kubiks-inc/kubiks-cli/actions/workflows/test.yml)

## 🎬 Demo

![Kubiks CLI Demo](images/demo.gif)

## 🎯 What is Kubiks CLI?

When something breaks in your Next.js app, wouldn't it be amazing if your AI code editor could see exactly what happened? **Kubiks CLI makes this possible.**

- 📊 **Capture everything**: Requests, AI SDK calls, tool calls and many more
- 🤖 **Feed Cursor** complete context available to Cursros through MCP (Model Context Protocol)  
- ⚡ **Debug faster**: Ask Cursor to fix issues with full trace data and request payloads

## 🔥 Quick Start

### 1. Install Kubiks CLI

#### Via npm (macOS/Linux)
```bash
npm i -g @kubiks/cli
```

#### Or via Homebrew (macOS/Linux)
```bash
brew install kubiks-inc/tap/kubiks
```

#### Or download for your platform
[⬇️ Download from releases](https://github.com/kubiks-inc/kubiks-cli/releases)

### 2. Set up OpenTelemetry in your Next.js app

#### Install the Vercel OTEL package
```bash
npm i @vercel/otel
```

#### Create instrumentation.ts in your Next.js app root directory
```typescript
// instrumentation.ts
import { registerOTel, OTLPHttpJsonTraceExporter } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: "your-project-name",
    traceExporter: new OTLPHttpJsonTraceExporter({
      // Prefer traces-specific endpoint, fallback to base
      url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    }),
  });
}
```

#### Enable experimental telemetry for AI SDK calls

To capture AI SDK calls like `generateText`, `streamText`, and `generateObject`, you need to enable experimental telemetry in your AI SDK configuration:

```typescript
import { generateText } from 'ai';

const result = await generateText({
  model: 'openai/gpt-4',
  prompt: 'Hello, world!',
  experimental_telemetry: {
    isEnabled: true,
  },
});
```

**Note**: This experimental telemetry feature must be enabled for each AI SDK call to ensure proper trace capture.

### 3. Start debugging like a pro

```bash
# In your Next.js project directory
kubiks
```

This will automatically configure OpenTelemetry and start capturing traces from your Next.js application.

## ⚙️ Configuration (env)

- Local-first guarantees
  - Kubiks runs a local OTLP HTTP collector at `http://localhost:7432` and always writes to a local SQLite DB used by the UI and MCP. This path is permanent.
  - Remote export is an additional mirror.

- Endpoints
  - `OTEL_EXPORTER_OTLP_ENDPOINT` (base, e.g. `http://collector:4318`) — used to derive per-signal endpoints if not explicitly set
  - `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` (override) — if set, used as remote mirror target for traces; the app still also sends traces to `http://localhost:7432/v1/traces`
  - `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` (override) — remote mirror target for logs
  - `OTEL_EXPORTER_OTLP_PROTOCOL` — `http/json` (default)
  - `OTEL_EXPORTER_OTLP_HEADERS` — comma-separated `Key=Value` pairs for auth (e.g., `Authorization=Bearer <token>`)

- Console logs forwarding
  - Kubiks captures your app `stdout`/`stderr` and forwards them to the remote logs endpoint as OTLP/HTTP JSON (and always stores them locally for the UI):
    - Derives remote logs endpoint from base → `/v1/logs` unless `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` is set
  - Optional single-line JSON console output (less row spam):
    - `KUBIKS_LOGS_SINGLE_LINE_JSON=true`
    - Wraps console methods to emit a single JSON line per call: `{time, level, service, message}`

## 🧭 How it works

- Local collector: `:7432`
  - Receives OTLP HTTP JSON: `/v1/traces`, `/v1/logs`, `/v1/metrics`
  - Inserts into local SQLite (UI + MCP read from here)
  - If remote endpoints are configured, mirrors the same payloads upstream (local write never depends on remote success)

- App launcher
  - Always sets `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:7432/v1/traces` for the Next.js dev server to ensure the local DB is populated
  - Uses your `.env` to derive the remote mirror target(s)

## 🧠 MCP integration

- MCP tools fetch from the local SQLite DB (never the remote).
- Because we always write locally first, MCP remains fully functional even if the remote collector is down.

## 🤝 Contributing

We welcome contributions! This is an open-source project built for the developer community.

### Quick Development Setup

```bash
git clone https://github.com/kubiks-inc/kubiks-cli.git
cd kubiks-cli
make deps
make test
make build
```

## 🌟 Star us!

Drop us a star — it keeps us building!

[⭐ Star on GitHub](https://github.com/kubiks-inc/kubiks-cli)

## 📄 License

Apache 2.0 License - see [LICENSE](LICENSE) file for details.

## 🛟 Support & Community

- 🐛 [Report issues](https://github.com/kubiks-inc/kubiks-cli/issues/new/choose)
- 💡 [Request features](https://github.com/kubiks-inc/kubiks-cli/issues/new/choose)
- 💬 [Join discussions](https://github.com/kubiks-inc/kubiks-cli/discussions)
- 📧 Email: [support@kubiks.ai](mailto:support@kubiks.ai)

---

**Made with ❤️ by engineers, for engineers.** Happy debugging! 🐛✨