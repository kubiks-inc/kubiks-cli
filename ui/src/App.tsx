import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TracesContent } from './containers/traces/traces-element'

export default function App() {
  return (
    <div className="min-h-svh p-6 font-sans">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TracesContent />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}


