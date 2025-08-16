# Kubiks CLI

[![Tests](https://github.com/kubiks-inc/kubiks-cli/actions/workflows/test.yml/badge.svg)](https://github.com/kubiks-inc/kubiks-cli/actions/workflows/test.yml)

## 🎬 Demo

![Kubiks CLI Demo](images/kubiks-cli-demo.gif)

## 🎯 What is Kubiks CLI?

When something breaks in your Next.js app, wouldn't it be amazing if your AI code editor could see exactly what happened? **Kubiks CLI makes this possible.**

- 📊 **Capture everything**: Requests, AI SDK calls, tool calls and many more
- 🤖 **Feed Cursor** complete context available to Cursros through MCP (Model Context Protocol)  
- ⚡ **Debug faster**: Ask Cursor to fix issues with full trace data and request payloads

## 🔥 Quick Start

### 1. Install Kubiks CLI

#### Via Homebrew (macOS/Linux)
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
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    }),
  });
}
```

### 3. Start debugging like a pro

```bash
# In your Next.js project directory
kubiks
```

This will automatically configure the OpenTelemetry environment variables and start capturing traces from your Next.js application.

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