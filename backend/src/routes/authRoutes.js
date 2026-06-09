// authRoutes.js — rotas de autenticação

const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// POST /auth/login — não requer autenticação (rota pública)
router.post('/login', login);

module.exports = router;
