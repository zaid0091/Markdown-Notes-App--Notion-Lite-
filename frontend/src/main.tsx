import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './context/AuthContext'
import { AppRoutes } from './routes/AppRoutes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryProvider>
  </StrictMode>,
)
