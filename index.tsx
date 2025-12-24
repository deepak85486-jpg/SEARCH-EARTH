
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Safely shim process.env for browser environments
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}
// Do NOT overwrite API_KEY if it's already set by the environment/bundler
if (!(window as any).process.env.API_KEY) {
  (window as any).process.env.API_KEY = "";
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
