import React from 'react';
import Head from 'next/head';

export default function HomeSimple() {
  return (
    <>
      <Head>
        <title>BOOM Card - Premium Dining & Lifestyle Rewards</title>
        <meta name="description" content="Join Bulgaria's premier dining and lifestyle rewards program" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">BOOM Card</h1>
          <p className="text-2xl mb-8">Premium Dining & Lifestyle Rewards</p>
          <div className="space-x-4">
            <a href="/register" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block">
              Get Started
            </a>
            <a href="/login" className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 inline-block">
              Sign In
            </a>
          </div>
        </div>
      </div>
    </>
  );
}