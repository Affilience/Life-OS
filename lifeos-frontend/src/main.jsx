import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Fresh start: Clear all localStorage for clean testing
// Remove this block after testing is complete
if (!localStorage.getItem('lifeos-fresh-start-done')) {
  console.log('🧹 Clearing localStorage for fresh start...');
  localStorage.clear();
  localStorage.setItem('lifeos-fresh-start-done', 'true');
  window.location.reload();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
