// prismaClient.js — instância única do Prisma Client
// Exportamos uma única instância para evitar múltiplas conexões com o banco

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
