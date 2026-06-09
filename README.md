# Microsserviço de Cadastro e Autenticação de Usuários

Stack: Node.js + Express + Prisma + MySQL + React + Vite + Tailwind CSS

# Integrantes

- Guilherme Tófoli da Silva
- Abner Castanho Cardoso

---

## Estrutura de Pastas

```
projeto-auth/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma           # Modelo do banco de dados (tabela users)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js   # Lógica de login + geração de JWT
│   │   │   └── userController.js   # CRUD completo com Soft Delete
│   │   ├── middleware/
│   │   │   └── authMiddleware.js   # Verificação do token JWT nas rotas protegidas
│   │   ├── prisma/
│   │   │   └── prismaClient.js     # Instância única do Prisma Client
│   │   ├── routes/
│   │   │   ├── authRoutes.js       # POST /auth/login
│   │   │   └── userRoutes.js       # GET/POST/PUT/DELETE /users
│   │   └── server.js               # Entrada da aplicação Express
│   ├── .env                        # Variáveis de ambiente (não subir no git)
│   ├── .env.example                # Modelo do .env para referência
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── PrivateRoute.jsx    # Bloqueia rotas sem JWT válido
    │   ├── context/
    │   │   └── AuthContext.jsx     # Estado global de autenticação
    │   ├── pages/
    │   │   ├── Login.jsx           # Tela de login
    │   │   ├── Cadastro.jsx        # Tela de cadastro de novo usuário
    │   │   └── Dashboard.jsx       # Tabela de usuários + editar + deletar
    │   ├── services/
    │   │   └── api.js              # Axios com interceptors (token automático)
    │   ├── App.jsx                 # Definição das rotas
    │   ├── main.jsx                # Ponto de entrada do React
    │   └── index.css               # Diretivas do Tailwind CSS
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## ══════════════════════════════════════
## PARTE 1 — BACKEND (responsável: Aluno A)
## ══════════════════════════════════════

### Pré-requisitos
- Node.js versão 18 ou superior
- MySQL instalado e rodando na porta 3306
- Usuário `root` com acesso (sem senha ou com senha configurada)

---

### Passo 1 — Criar o banco de dados

Abra PHPMYADMIN ou MYSQL Workbench

Dentro do MySQL, crie o banco:

```sql
CREATE DATABASE auth_db;
```

---

### Passo 2 — Entrar na pasta do backend e instalar dependências

```bash
cd backend
npm install
```

Pacotes instalados:
- **express** — framework web
- **cors** — permite requisições do frontend (porta diferente)
- **dotenv** — carrega variáveis do arquivo `.env`
- **bcryptjs** — criptografa e compara senhas
- **jsonwebtoken** — gera e valida tokens JWT
- **@prisma/client** — acesso ao banco via Prisma
- **prisma** *(dev)* — CLI para migrations
- **nodemon** *(dev)* — reinicia o servidor automaticamente ao salvar

---

### Passo 3 — Configurar o arquivo .env

Crie o arquivo `.env` dentro da pasta `backend` com o seguinte conteúdo:

```env
DATABASE_URL="mysql://root:@localhost:3306/auth_db"
JWT_SECRET="uma_string_longa_e_aleatoria_aqui"
PORT=3001
```

> ⚠️ Se seu MySQL tiver senha, use: `mysql://root:SUA_SENHA@localhost:3306/auth_db`
> ⚠️ Sem senha: `mysql://root:@localhost:3306/auth_db` (dois pontos sem nada depois)

---

### Passo 4 — Rodar a migration do Prisma

O schema já está em `prisma/schema.prisma`. Rode o comando abaixo para criar a tabela `users` no banco:

```bash
npx prisma migrate dev --name init
```

Resultado esperado:
```
✔ Generated Prisma Client
✔ Your database is now in sync with your schema.
```

---

### Passo 5 — Iniciar o servidor

```bash
npm run dev
```

Servidor rodando em: `http://localhost:3001`

Teste rápido:
```bash
curl http://localhost:3001/health
# {"status":"ok","message":"Servidor funcionando!"}
```

---

### Rotas da API

| Método | Rota          | Autenticação | Descrição                         |
|--------|---------------|:------------:|-----------------------------------|
| GET    | /health       | Não          | Verifica se o servidor está ativo |
| POST   | /auth/login   | Não          | Login — retorna token JWT         |
| POST   | /users        | Não          | Cadastrar novo usuário            |
| GET    | /users        | Sim          | Listar todos os usuários ativos   |
| GET    | /users/:id    | Sim          | Buscar usuário por ID             |
| PUT    | /users/:id    | Sim          | Atualizar dados do usuário        |
| DELETE | /users/:id    | Sim          | Soft Delete (preenche deletedAt)  |

Rotas autenticadas exigem o header:
```
Authorization: Bearer <token_jwt>
```

---

### Exemplos de teste com curl

**Cadastrar usuário:**
```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","email":"joao@email.com","senha":"123456","endereco":"Rua A, 123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","senha":"123456"}'
```

---

## ══════════════════════════════════════
## PARTE 2 — FRONTEND (responsável: Aluno B)
## ══════════════════════════════════════

### Pré-requisitos
- Backend rodando em `http://localhost:3001`
- Node.js versão 18 ou superior

---

### Passo 1 — Entrar na pasta do frontend e instalar dependências

```bash
cd frontend
npm install
```

Pacotes instalados:
- **react + react-dom** — biblioteca React
- **react-router-dom** — roteamento entre páginas
- **axios** — cliente HTTP para consumir a API
- **tailwindcss + postcss + autoprefixer** — estilização
- **vite + @vitejs/plugin-react** — bundler e servidor de desenvolvimento

---

### Passo 2 — Iniciar o frontend

```bash
npm run dev
```

Frontend disponível em: `http://localhost:5173`

> Para acessar o dashboard pela primeira vez, acesse `/cadastro` para criar um usuário e depois faça login em `/login`.

---

### Fluxo de navegação

```
/            →  redireciona automaticamente para /login
/login       →  formulário de login (rota pública)
/cadastro    →  formulário de cadastro (rota pública)
/dashboard   →  tabela de usuários (rota PROTEGIDA — exige JWT válido)
```

---

### Como funciona a autenticação no frontend

1. Ao fazer login com sucesso, o token JWT é salvo no `localStorage` com a chave `"token"`
2. O arquivo `services/api.js` configura o Axios para ler e enviar esse token automaticamente em toda requisição
3. Se o backend retornar erro 401 (token expirado ou inválido), o interceptor limpa o `localStorage` e redireciona para `/login`
4. O componente `PrivateRoute` verifica se há usuário logado antes de renderizar rotas protegidas
5. O botão "Sair" no Dashboard limpa o `localStorage` e redireciona para `/login`

---

## Conceitos implementados

### Soft Delete
Ao clicar em "Deletar" no Dashboard, o registro **não é removido** do banco. O backend apenas preenche o campo `deletedAt` com a data/hora atual. Todas as consultas filtram `deletedAt = null`, tornando o usuário invisível nas listagens sem perder o histórico no banco.

### Criptografia de senha
As senhas nunca são salvas em texto puro. O `bcryptjs` gera um hash irreversível no cadastro e na atualização, e compara de forma segura no login.

### Token JWT
O payload do token contém obrigatoriamente `id`, `nome` e `email` do usuário, e expira em 8 horas. Toda rota protegida do backend valida o token via `authMiddleware` antes de processar a requisição.

### Modelo de dados (tabela `users`)

| Campo     | Tipo      | Descrição                                |
|-----------|-----------|------------------------------------------|
| id        | UUID      | Chave primária gerada automaticamente    |
| nome      | String    | Nome do usuário                          |
| email     | String    | E-mail único (UNIQUE constraint)         |
| senha     | String    | Hash bcrypt da senha                     |
| endereco  | String    | Endereço do usuário                      |
| createdAt | DateTime  | Data de criação (automático)             |
| updatedAt | DateTime  | Data da última atualização (automático)  |
| deletedAt | DateTime? | Nulo = ativo / Preenchido = soft deleted |
