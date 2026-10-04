import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PortalRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirige al dashboard correcto según el rol del usuario
  return <Navigate to={`/portal/${user.role}`} replace />;
}
