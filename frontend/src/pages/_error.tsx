import React from 'react';
import Link from 'next/link';
import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">{statusCode}</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {statusCode === 404 ? 'Page Not Found' : 'An error occurred'}
        </h2>
        <p className="text-gray-600 mb-8">
          {statusCode === 404
            ? "The page you're looking for doesn't exist."
            : 'Something went wrong. Please try again later.'}
        </p>
        <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          Go Home
        </Link>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;