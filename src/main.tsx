import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeApp } from './utils/initApp';
import './index.css';

async function startApp() {
  await initializeApp({
    enableServiceWorker: true,
    enableLovable: true
  });

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

startApp().catch(console.error);
