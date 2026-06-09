// authMiddleware.js — middleware de autenticação JWT
// Intercepta as requisições e verifica se o token é válido
// Rotas protegidas devem usar este middleware antes do controller

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // O token vem no cabeçalho Authorization no formato: "Bearer <token>"
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  // Separa o "Bearer" do token em si
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Formato de token inválido.' });
  }

  try {
    // Verifica e decodifica o token usando a chave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Anexa o payload decodificado à requisição para uso nos controllers
    req.user = decoded;

    next(); // Passa para o próximo middleware ou controller
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

module.exports = authMiddleware;
