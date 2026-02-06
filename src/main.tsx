import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HackathonStageProvider } from './context/HackathonStageContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HackathonStageProvider>
      <App />
    </HackathonStageProvider>
  </StrictMode>,
)
