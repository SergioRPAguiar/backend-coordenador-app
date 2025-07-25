# Backend Coordenador.App

> API RESTful para o gerenciamento de usuários, autenticação JWT, agendamento de reuniões e upload de arquivos, desenvolvida com NestJS.

## 🚀 Visão Geral

Este repositório contém o backend do **Coordenador.App**, uma aplicação para:

- Registro, login e confirmação de usuários (alunos e professores) via código de e-mail
- Autenticação baseada em JWT e controle de acesso por roles (admin, professor, aluno)
- CRUD de usuários, reuniões e agendas (schedules)
- Upload/download de arquivos (logo e outros)
- Health check e disparo de e-mail de teste via cron job

## 🛠️ Tecnologias

- **Node.js** + **NestJS** (TypeScript)
- **Express** (integrado ao Nest)
- **MongoDB** (via Mongoose)
- **JWT** para autenticação
- **Bcrypt** para hashing de senhas
- **Multer** para upload de arquivos
- **SMTP / EmailService** para envio de e-mails

## 📁 Estrutura do Projeto

```
src/
├─ app.controller.ts         # Root Controller
├─ auth/                    # Autenticação e usuários
│  ├─ auth.controller.ts
│  └─ auth.service.ts
├─ user/                    # CRUD de usuários
│  ├─ user.controller.ts
│  └─ user.service.ts
├─ meeting/                 # Reuniões
├─ schedule/                # Agendas (timeslots)
├─ file-upload/             # Upload/download de arquivos
├─ config/                  # Configurações da aplicação
├─ email/                   # Serviço de envio de e-mail
├─ cron/                    # Tarefas agendadas
├─ health/                  # Health check
└─ main.ts                  # Ponto de entrada
```

## ⚙️ Instalação & Setup

### Pré-requisitos

- **Node.js** v18+
- **npm** ou **yarn**
- **MongoDB** (local ou Atlas)

### Passos

1. Clone o repositório:
   ```bash
   git clone https://github.com/SergioRPAguiar/backend-coordenador-app.git
   cd backend-coordenador-app
   ```
2. Instale dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```
3. Crie um arquivo `.env` na raiz com as variáveis:
   ```dotenv
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/coordenador-app
   JWT_SECRET=seuSegredoJWT
   JWT_EXPIRATION=3600s
   API_URL=http://localhost:3000
   SMTP_HOST=smtp.exemplo.com
   SMTP_PORT=587
   SMTP_USER=usuario@example.com
   SMTP_PASS=senha
   ```
4. Inicie o servidor:
   ```bash
   npm run start:dev
   # ou
   yarn start:dev
   ```
5. Acesse em `http://localhost:3000/health` para verificar o health check.

## 📚 Documentação da API

- **Postman Collection**: importe o guia completo de rotas para testar todos os endpoints.
- **Arquivo:** [`API_Postman_Guide.md`](./API_Postman_Guide.md) (ou [coleção JSON do Postman])

## 🛡️ Rotas Principais

| Recurso  | Rota                          | Método | Auth      |
| -------- | ----------------------------- | ------ | --------- |
| Auth     | `/auth/register`              | POST   | Não       |
| Auth     | `/auth/login`                 | POST   | Não       |
| Auth     | `/auth/me`                    | GET    | JWT       |
| User     | `/user`                       | POST   | Não       |
| User     | `/user/:id`                   | GET    | JWT       |
| Meeting  | `/meeting`                    | POST   | JWT       |
| Meeting  | `/meeting/:id`                | GET    | JWT       |
| Schedule | `/schedule/available/:date`   | GET    | Não       |
| File     | `/upload/logo`                | POST   | JWT/Admin |
| Config   | `/config/update-name`         | POST   | JWT/Admin |
| ...      | (veja `API_Postman_Guide.md`) |        |           |

## 🧪 Testes

*(Adicionar instruções de testes automatizados, se houver.)*

## 🤝 Contribuição

1. Fork este repositório
2. Crie uma branch: `git checkout -b feat/nova-funcionalidade`
3. Commit suas alterações: `git commit -m 'feat: descrição'`
4. Push para sua branch: `git push origin feat/nova-funcionalidade`
5. Abra um Pull Request

> Para detalhes completos das rotas e exemplos de request/responses, consulte o arquivo `API_Postman_Guide.md`.\
> Se faltar alguma informação (ex.: DTOs, testes), me avise para complementar!

