import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {AuthProvider} from './context/AuthContext'; //Avvolgo dentro AuthProvider così l'intera app potrà accedere al contesto

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <AuthProvider>
          <App />
      </AuthProvider>
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/service-worker.js")
            .then((registration) => {
                console.log("[SW] Registrato:", registration.scope);
            })
            .catch((error) => {
                console.error("[SW] Registrazione fallita:", error);
            });
    });
}