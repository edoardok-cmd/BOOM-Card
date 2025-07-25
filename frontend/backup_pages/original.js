import React from 'react';

export default function OriginalVersion() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-red-600 to-purple-700">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-white text-center mb-8">
          BOOM Card - Original Version
        </h1>
        <p className="text-xl text-white text-center mb-12">
          This is the original TypeScript version before Phase 1 fixes
        </p>
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Version Info</h2>
          <ul className="space-y-2 text-lg">
            <li>• 47 TypeScript conversion syntax errors (now fixed)</li>
            <li>• Original components and structure</li>
            <li>• Running on port 3003</li>
            <li>• Pre-Phase 1 state (simulated)</li>
            <li>• Connected to simplified backend on port 8004</li>
          </ul>
          
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4">API Status</h3>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm">Backend URL: http://localhost:8004</p>
              <p className="text-sm">Frontend Port: 3003</p>
            </div>
          </div>

          <div className="mt-8 space-x-4">
            <a 
              href="http://localhost:3001" 
              className="inline-block bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-colors"
            >
              View Fixed Version →
            </a>
            <a 
              href="http://localhost:3000" 
              className="inline-block bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-colors"
            >
              View AI Platform →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}