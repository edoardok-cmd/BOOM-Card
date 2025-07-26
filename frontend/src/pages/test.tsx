import React, { useEffect } from 'react';

export default function TestPage() {
  useEffect(() => {
    console.log('Test page mounted successfully');
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Test Page</h1>
      <p>If you can see this, the site is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}