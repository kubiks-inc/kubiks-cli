import React, { useEffect } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'

function Home() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Kubiks UI</h1>
      <p className="mt-2 text-muted-foreground">Hello World — the UI is embedded in the CLI binary.</p>
      <div className="mt-4 rounded-lg border p-4">
        <p>
          OTEL: <code>http://localhost:7432</code> · MCP SSE: <code>http://localhost:7433/mcp/sse</code>
        </p>
      </div>
      <div className="mt-6">
        <Link className="text-blue-600 underline" to="/trace/123">Go to Trace 123</Link>
      </div>
    </div>
  )
}

function TracePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Trace</h1>
      <p className="mt-2">Hello World</p>
    </div>
  )
}

export default function App() {
  useEffect(() => {
    fetch('http://localhost:7432/api/traces?limit=5')
      .then((r) => r.json())
      .then((data) => {
        console.log('Traces:', data)
      })
      .catch((e) => console.error('Failed to fetch traces', e))
  }, [])
  return (
    <div className="min-h-svh p-6 font-sans">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trace/:id" element={<TracePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}


