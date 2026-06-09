// server.js — ponto de entrada da aplicação Express

require('dotenv').config(); // Carrega as variáveis do arquivo .env
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middlewares Globais ──────────────────────────────────────────────────────

// Habilita o CORS para permitir requisições do frontend (rodando em outra porta)
app.use(cors({
  origin: 'http://localhost:5173', // Porta padrão do Vite
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Habilita o parsing de JSON no corpo das requisições
app.use(express.json());

// ─── Rotas ────────────────────────────────────────────────────────────────────

// Rota de health check — útil para verificar se o servidor está online
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Servidor funcionando!' });
});

// Rotas da aplicação
app.use('/auth', authRoutes);   // Autenticação: POST /auth/login
app.use('/users', userRoutes);  // CRUD de usuários: /users, /users/:id

// ─── Inicia o servidor ────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
