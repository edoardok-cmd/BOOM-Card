import React from 'react';
import Link from 'next/link';

export default function Custom500() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Server Error</h2>
        <p className="text-gray-600 mb-8">Something went wrong on our end. Please try again later.</p>
        <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          Go Home
        </Link>
      </div>
    </div>
  );
}

// Force server-side rendering
export async function getServerSideProps() {
  return {
    props: {},
  }
}