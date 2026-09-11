import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ProductEntryGate from './ProductEntryGate'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProductEntryGate />
  </StrictMode>,
)
