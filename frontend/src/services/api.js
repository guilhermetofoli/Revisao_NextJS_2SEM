// api.js — instância configurada do Axios
// Centraliza a URL base e o envio automático do token JWT

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // URL do backend
});

// Interceptor de requisição: adiciona o token JWT automaticamente em toda chamada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    // Formato esperado pelo backend: "Bearer <token>"
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor de resposta: redireciona para login se o token expirar (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
