// authController.js — lógica de autenticação (login)

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/prismaClient');

/**
 * POST /auth/login
 * Valida e-mail e senha, e retorna um JWT se as credenciais forem válidas.
 */
const login = async (req, res) => {
  const { email, senha } = req.body;

  // Validação básica dos campos obrigatórios
  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // Busca o usuário pelo e-mail, garantindo que NÃO esteja deletado
    const usuario = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null, // Soft delete: ignora usuários deletados
      },
    });

    // Mensagem genérica por segurança (não revela se o e-mail existe ou não)
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Compara a senha enviada com o hash armazenado no banco
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Cria o payload do JWT com os dados obrigatórios
    const payload = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    };

    // Gera o token com validade de 8 horas
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });

    return res.status(200).json({
      message: 'Login realizado com sucesso.',
      token,
      usuario: payload, // Retorna os dados básicos do usuário para o frontend
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = { login };
