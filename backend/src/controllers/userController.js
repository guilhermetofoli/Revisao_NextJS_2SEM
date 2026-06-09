// userController.js — CRUD completo de usuários com Soft Delete

const bcrypt = require('bcryptjs');
const prisma = require('../prisma/prismaClient');

/**
 * POST /users
 * Cadastra um novo usuário.
 * - Verifica duplicidade de e-mail
 * - Criptografa a senha com bcrypt antes de salvar
 */
const criarUsuario = async (req, res) => {
  const { nome, email, senha, endereco } = req.body;

  // Valida campos obrigatórios
  if (!nome || !email || !senha || !endereco) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios: nome, email, senha, endereco.' });
  }

  try {
    // Verifica se já existe um usuário ativo com este e-mail
    const emailExistente = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (emailExistente) {
      return res.status(409).json({ error: 'Este e-mail já está em uso.' });
    }

    // Criptografa a senha (salt rounds = 10 é o padrão recomendado)
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Cria o usuário no banco
    const novoUsuario = await prisma.user.create({
      data: {
        nome,
        email,
        senha: senhaCriptografada,
        endereco,
      },
      // Seleciona apenas os campos seguros para retornar (nunca retorna a senha)
      select: {
        id: true,
        nome: true,
        email: true,
        endereco: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ message: 'Usuário criado com sucesso.', usuario: novoUsuario });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * GET /users
 * Lista todos os usuários ativos (deletedAt = null).
 * A senha nunca é retornada.
 */
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      where: { deletedAt: null }, // Soft delete: apenas usuários ativos
      select: {
        id: true,
        nome: true,
        email: true,
        endereco: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }, // Mais recentes primeiro
    });

    return res.status(200).json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * GET /users/:id
 * Busca um usuário ativo pelo ID.
 */
const buscarUsuarioPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await prisma.user.findFirst({
      where: {
        id,
        deletedAt: null, // Soft delete: não encontra usuários deletados
      },
      select: {
        id: true,
        nome: true,
        email: true,
        endereco: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * PUT /users/:id
 * Atualiza os dados de um usuário ativo.
 * Se a senha for enviada, ela é re-criptografada.
 */
const atualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha, endereco } = req.body;

  try {
    // Verifica se o usuário existe e está ativo
    const usuarioExistente = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!usuarioExistente) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Se o e-mail for alterado, verifica se já pertence a outro usuário ativo
    if (email && email !== usuarioExistente.email) {
      const emailDuplicado = await prisma.user.findFirst({
        where: { email, deletedAt: null, NOT: { id } },
      });

      if (emailDuplicado) {
        return res.status(409).json({ error: 'Este e-mail já está em uso por outro usuário.' });
      }
    }

    // Monta o objeto de atualização dinamicamente (só atualiza o que foi enviado)
    const dadosAtualizados = {};
    if (nome) dadosAtualizados.nome = nome;
    if (email) dadosAtualizados.email = email;
    if (endereco) dadosAtualizados.endereco = endereco;
    if (senha) dadosAtualizados.senha = await bcrypt.hash(senha, 10);

    const usuarioAtualizado = await prisma.user.update({
      where: { id },
      data: dadosAtualizados,
      select: {
        id: true,
        nome: true,
        email: true,
        endereco: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({ message: 'Usuário atualizado com sucesso.', usuario: usuarioAtualizado });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * DELETE /users/:id
 * Realiza o Soft Delete: NÃO remove o registro do banco.
 * Apenas preenche o campo deletedAt com a data/hora atual.
 */
const deletarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    // Verifica se o usuário existe e ainda está ativo
    const usuarioExistente = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!usuarioExistente) {
      return res.status(404).json({ error: 'Usuário não encontrado ou já deletado.' });
    }

    // Soft Delete: preenche deletedAt com o momento atual
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return res.status(200).json({ message: 'Usuário deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  criarUsuario,
  listarUsuarios,
  buscarUsuarioPorId,
  atualizarUsuario,
  deletarUsuario,
};
