
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Prevent multiple root creation
const rootElement = document.getElementById('root');
if (!rootElement) {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
