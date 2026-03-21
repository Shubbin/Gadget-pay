import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import React from "react"; // Added for React.StrictMode
import { BrowserRouter } from "react-router-dom"; // Added for BrowserRouter

// Changed createRoot to ReactDOM.createRoot and wrapped App in StrictMode and BrowserRouter
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

// Added service worker registration logic
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
