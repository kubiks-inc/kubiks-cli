export default function App() {
  return (
    <div className="min-h-svh p-6 font-sans">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">Kubiks UI</h1>
        <p className="mt-2 text-muted-foreground">Hello World — the UI is embedded in the CLI binary.</p>
        <div className="mt-4 rounded-lg border p-4">
          <p>
            OTEL: <code>http://localhost:7432</code> · MCP SSE: <code>http://localhost:7433/mcp/sse</code>
          </p>
        </div>
      </div>
    </div>
  )
}


