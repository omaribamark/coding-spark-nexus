/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const WebPlaceholder: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f 0%, #4a1d6a 50%, #2d3766 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '28rem', width: '100%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', borderRadius: '24px', padding: '32px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ width: '80px', height: '80px', margin: '0 auto 16px', background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2.5rem' }}>📱</span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Hakikisha</h1>
          <p style={{ color: '#93c5fd' }}>Fact-Checking Mobile App</p>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '16px' }}>📋 Run Instructions</h2>
          <div style={{ textAlign: 'left', color: '#bfdbfe', fontSize: '0.875rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '12px', fontFamily: 'monospace' }}>
              <p style={{ color: '#4ade80', marginBottom: '4px' }}># Install dependencies</p>
              <p style={{ margin: 0 }}>npm install --legacy-peer-deps</p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '12px', fontFamily: 'monospace' }}>
              <p style={{ color: '#4ade80', marginBottom: '4px' }}># Start Expo dev server</p>
              <p style={{ margin: 0 }}>npx expo start</p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', fontFamily: 'monospace' }}>
              <p style={{ color: '#4ade80', marginBottom: '4px' }}># Build for production</p>
              <p style={{ margin: 0 }}>eas build --platform all</p>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '12px', padding: '16px' }}>
          <p style={{ color: '#fde68a', fontSize: '0.875rem', margin: 0 }}>
            <strong>Note:</strong> This is a React Native app. The web preview shows instructions only. 
            Run on a real device or emulator using Expo.
          </p>
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WebPlaceholder />
  </React.StrictMode>
);
