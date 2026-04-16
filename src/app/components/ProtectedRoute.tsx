import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  // Si no hay sesión, regresamos a /login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // De otra forma, renderizar las rutas hijas de este submenú (Outline)
  return <Outlet />;
};


//responder dentro de termons de seguridad en entornos de termonilogias y estaos de las siegueintes perosnas 