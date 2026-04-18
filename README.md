# Url API

API RESTful para encurtador de url, permitindo controle de usuários, cada usuário tem suas urls onde pode cria-las, deletar, e ler, além de expirar e controle de cliques.

## Sobre o projeto

Esta API foi desenvolvida com foco em boas práticas de arquitetura backend, incluindo:

- Separação de responsabilidades (Controller → Service → Database)
- Validação robusta com Zod
- Autenticação segura com JWT
- Testes com Jest
- Persistência com Prisma ORM

## Tecnologias utilizadas

- Node.js
- Typescript
- Express
- Prisma ORM
- PostgreSQL
- JWT (JSON Web Token)
- bcrypt
- Zod
- Jest

## Configuração do ambiente

### 1. Clone o repositório

```bash
git clone https://github.com/otaviobonini/url-shortener-api.git
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/url_shortener"
JWT_SECRET="sua_chave_secreta"
PORT=3333
```

### 4. Execute as migrations

```bash
npx prisma migrate deploy
```

### 5. Inicie o servidor

```bash
npm run dev
```

Servidor disponível em:

```
http://localhost:3333
```

## Autenticação

A API utiliza JWT.

Após login, utilize o token no header:

```
Authorization: Bearer <token>
```

## Endpoints

### Auth

| Método | Rota      | Descrição |
| ------ | --------- | --------- |
| POST   | /register | Cadastro  |
| POST   | /login    | Login     |

### Url (protegido)

| Método | Rota            | Descrição                           |
| ------ | --------------- | ----------------------------------- |
| GET    | /url            | Listar as urls do usuários          |
| GET    | /url/:hashedUrl | Redirecionar usuário à url original |
| POST   | /url            | Criar url                           |
| DELETE | /url/:id        | Deletar url                         |

## Exemplos de uso

### Criar Usuário

```bash
curl -X POST http://localhost:3333/register \
-H "Content-Type: application/json" \
-d '{"name":"João","email":"joao@email.com","password":"123456"}'
```

### Login

```bash
curl -X POST http://localhost:3333/login \
-H "Content-Type: application/json" \
-d '{"email":"joao@email.com","password":"123456"}'
```

### Criar URL encurtada

```bash
curl -X POST http://localhost:3333/url \
-H "Authorization: Bearer SEU_TOKEN" \
-H "Content-Type: application/json" \
-d '{  "url": "https://google.com", "expires": "2026-12-31T23:59:59.000Z"  }'
```

## Scripts

```bash
npm run dev    # Desenvolvimento
npm start      # Produção
```

## Testes

Use npm run tests para rodar os testes em seu terminal
