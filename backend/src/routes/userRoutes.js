// userRoutes.js — rotas do CRUD de usuários
// Todas as rotas (exceto cadastro) são protegidas pelo authMiddleware

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  criarUsuario,
  listarUsuarios,
  buscarUsuarioPorId,
  atualizarUsuario,
  deletarUsuario,
} = require('../controllers/userController');

// POST /users — cadastro é público (não exige token)
router.post('/', criarUsuario);

// Rotas abaixo exigem autenticação via JWT
router.get('/', authMiddleware, listarUsuarios);           // GET    /users
router.get('/:id', authMiddleware, buscarUsuarioPorId);   // GET    /users/:id
router.put('/:id', authMiddleware, atualizarUsuario);     // PUT    /users/:id
router.delete('/:id', authMiddleware, deletarUsuario);    // DELETE /users/:id

module.exports = router;
