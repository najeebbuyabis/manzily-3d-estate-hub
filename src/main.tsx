import React from 'react'
import { createRoot } from 'react-dom/client'
import TestComponent from './TestComponent.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'
import './lib/i18n'

// Debug React availability
console.log('React in main.tsx:', React);
console.log('React version:', React.version);

// Ensure React is properly available before continuing
if (!React || !React.useState) {
  console.error('React hooks not available - this will cause dispatcher errors');
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <TestComponent />
    </ErrorBoundary>
  </React.StrictMode>
);
