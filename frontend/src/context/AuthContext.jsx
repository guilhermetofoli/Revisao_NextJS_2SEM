// AuthContext.jsx — contexto global de autenticação
// Gerencia o estado de login do usuário em toda a aplicação

import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Cria o contexto (será preenchido pelo Provider abaixo)
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Inicializa o estado com os dados salvos no localStorage (se existirem)
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('usuario');
    return saved ? JSON.parse(saved) : null;
  });

  const navigate = useNavigate();

  /**
   * Realiza o login: chama a API, salva o token e redireciona para o dashboard.
   */
  const login = async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    const { token, usuario: dadosUsuario } = response.data;

    // Persiste token e dados do usuário no localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
    setUsuario(dadosUsuario);

    navigate('/dashboard');
  };

  /**
   * Realiza o logout: limpa o localStorage e redireciona para o login.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto de forma mais simples nos componentes
export function useAuth() {
  return useContext(AuthContext);
}
