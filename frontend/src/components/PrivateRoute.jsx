// PrivateRoute.jsx — componente de proteção de rotas
// Redireciona para /login se o usuário não estiver autenticado

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children }) {
  const { usuario } = useAuth();

  // Se não há usuário logado, redireciona para o login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;
