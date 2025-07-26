import React from 'react';

export default function Custom500() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', margin: '0 0 16px 0' }}>500</h1>
        <p style={{ fontSize: '18px', color: '#666' }}>Server Error</p>
        <a href="/" style={{ 
          display: 'inline-block',
          marginTop: '24px',
          padding: '12px 24px',
          backgroundColor: '#0070f3',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px'
        }}>
          Go Home
        </a>
      </div>
    </div>
  );
}