import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TelegramAuthGuard } from './presentation/components/TelegramAuthGuard'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TelegramAuthGuard>
      <App />
    </TelegramAuthGuard>
  </StrictMode>,
)
