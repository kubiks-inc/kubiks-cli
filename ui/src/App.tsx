import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TracesContent } from './containers/traces/traces-element'

export default function App() {
  return (
    <div className="min-h-svh p-6 font-sans">
      {/* Made with love by Kubiks */}
      <div className="absolute top-4 left-4 text-sm text-gray-600 hover:text-gray-800 transition-colors">
        Made with ❤️ by{' '}
        <a
          href="https://kubiks.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Kubiks
        </a>
      </div>

      <BrowserRouter>
        <div className="mt-4">
          <Routes>
            <Route path="/" element={<TracesContent />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  )
}


