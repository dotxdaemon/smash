// ABOUTME: Boots the React application into the root DOM node.
// ABOUTME: Applies global styles and mounts the top-level App component.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
