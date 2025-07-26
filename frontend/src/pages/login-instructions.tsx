import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

const LoginInstructionsPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Login Instructions - BOOM Card</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">🔐 Login Instructions</h1>
            
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-blue-900 mb-3">Backend Not Running</h2>
                <p className="text-blue-800 mb-4">
                  The backend server is not currently running at <code className="bg-blue-100 px-2 py-1 rounded">localhost:8003</code>.
                  The app is now using mock authentication.
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-green-900 mb-3">Test Credentials</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-green-800">Regular User:</h3>
                    <p className="text-sm text-green-700">Email: <code className="bg-green-100 px-2 py-1 rounded">test@example.com</code></p>
                    <p className="text-sm text-green-700">Password: <code className="bg-green-100 px-2 py-1 rounded">Test123!</code></p>
                  </div>
                  <div>
                    <h3 className="font-medium text-green-800">Admin User:</h3>
                    <p className="text-sm text-green-700">Email: <code className="bg-green-100 px-2 py-1 rounded">admin@boomcard.bg</code></p>
                    <p className="text-sm text-green-700">Password: <code className="bg-green-100 px-2 py-1 rounded">Admin123!</code></p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-yellow-900 mb-3">To Use Real Backend</h2>
                <ol className="list-decimal list-inside space-y-2 text-yellow-800">
                  <li>
                    <strong>Option 1:</strong> Use the deployed backend on Render
                    <p className="text-sm ml-6 mt-1">Update <code className="bg-yellow-100 px-1 rounded">.env.local</code> with Render URL</p>
                  </li>
                  <li>
                    <strong>Option 2:</strong> Run backend locally
                    <p className="text-sm ml-6 mt-1">
                      <code className="bg-yellow-100 px-1 rounded">cd ../backend && npm install && npm run dev</code>
                    </p>
                  </li>
                </ol>
              </div>

              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 text-center"
                >
                  Go to Login
                </Link>
                <Link
                  href="/"
                  className="flex-1 py-3 px-6 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300 text-center"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginInstructionsPage