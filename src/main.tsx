import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import { startSmoothScroll } from './smoothScroll'
import './styles.css'

startSmoothScroll()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
