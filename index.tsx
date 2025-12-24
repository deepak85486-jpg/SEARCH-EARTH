
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Shim process.env for browser environments to prevent ReferenceErrors on platforms like Vercel
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: { API_KEY: "" } };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
