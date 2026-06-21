import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SoundProvider } from './context/SoundContext';
import { LanguageProvider } from './context/LanguageContext';
import './styles/global.css';

// Register PWA Service Worker for offline play capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✔ PWA Service Worker registered:', reg.scope))
      .catch(err => console.warn('⚠ Service Worker registration failed:', err));
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <SoundProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </SoundProvider>
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>
);
