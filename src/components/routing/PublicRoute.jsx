import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/chat'

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  return children
}
