# Guia de Uso das Rotas da API no Postman

Este guia detalha passo a passo como testar todas as rotas disponíveis na API usando o Postman. Para cada rota, são descritos:

- **Método HTTP**
- **URL** (considerando `{{base_url}}` como variável de ambiente)
- **Descrição**
- **Autenticação** (quando aplicável)
- **Headers necessários**
- **Body / Params** (quando aplicável)
- **Passo a passo no Postman**

---

## 1. Configuração Inicial

1. Abra o Postman.
2. Crie um **Environment** chamado `Local`.
3. Adicione as variáveis:
   - `base_url` = `http://localhost:3000`
   - `token` = (deixe em branco)
4. Selecione o Environment criado.

---

## 2. Autenticação & Usuário

### 2.1 Registrar Usuário

- **Método:** POST
- **URL:** `{{base_url}}/auth/register`
- **Autenticação:** Não

**Headers:**

```
Content-Type: application/json
```

**Body (raw JSON):**

```json
{ "email": "usuario@exemplo.com", "password": "senha123", "name": "Nome Completo" }
```

**Passos:**

1. Criar nova requisição.
2. Selecionar **POST**.
3. Inserir URL.
4. Em **Headers**, adicionar `Content-Type: application/json`.
5. Em **Body**, escolher **raw** → **JSON**, colar JSON.
6. Enviar e verificar resposta.

---

### 2.2 Login

- **Método:** POST
- **URL:** `{{base_url}}/auth/login`
- **Autenticação:** Não

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{ "email": "usuario@exemplo.com", "password": "senha123" }
```

**Passos:**

1. Novo request → **POST** → URL.
2. Headers: `Content-Type: application/json`.
3. Body raw JSON.
4. Enviar.
5. Copiar `access_token` da resposta e definir variável `token`.

---

### 2.3 Obter Usuário Atual (Me)

- **Método:** GET
- **URL:** `{{base_url}}/auth/me`
- **Autenticação:** Sim

**Headers:**

```
Authorization: Bearer {{token}}
```

**Passos:**

1. Novo request → **GET** → URL.
2. Headers: `Authorization: Bearer {{token}}`.
3. Enviar.

---

## 3. Confirmação e Redefinição de Senha

### 3.1 Confirmar Usuário

- **Método:** POST
- **URL:** `{{base_url}}/auth/confirm`
- **Autenticação:** Não

**Body:**

```json
{ "email": "usuario@exemplo.com", "code": "123456" }
```

### 3.2 Esqueci Minha Senha

- **Método:** POST
- **URL:** `{{base_url}}/auth/forgot-password`
- **Autenticação:** Não

**Body:**

```json
{ "email": "usuario@exemplo.com" }
```

### 3.3 Confirmar Código de Reset

- **Método:** POST
- **URL:** `{{base_url}}/auth/confirm-reset`
- **Autenticação:** Não

**Body:**

```json
{ "email": "usuario@exemplo.com", "code": "654321" }
```

### 3.4 Redefinir Senha

- **Método:** POST
- **URL:** `{{base_url}}/auth/reset-password`
- **Autenticação:** Não

**Body:**

```json
{ "email": "usuario@exemplo.com", "code": "654321", "newPassword": "novaSenha123" }
```

### 3.5 Atualizar Senha (Autenticado)

- **Método:** POST
- **URL:** `{{base_url}}/auth/update-password`
- **Autenticação:** Sim

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**

```json
{ "currentPassword": "senha123", "newPassword": "novaSenha321" }
```

### 3.6 Reenviar Código

- **Método:** POST
- **URL:** `{{base_url}}/auth/resend-code`
- **Autenticação:** Não

**Body:**

```json
{ "email": "usuario@exemplo.com", "mode": "cadastro" }
```

---

## 4. Configurações da Aplicação

### 4.1 Obter Configuração

- **Método:** GET
- **URL:** `{{base_url}}/config`
- **Autenticação:** Não

### 4.2 Atualizar Nome do App

- **Método:** POST
- **URL:** `{{base_url}}/config/update-name`
- **Autenticação:** Sim (Admin)

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**

```json
{ "appName": "Meu App Novo" }
```

---

## 5. E-mail de Teste (Cron)

- **Método:** GET
- **URL:** `{{base_url}}/test-email`
- **Autenticação:** Sim (Admin)

**Headers:**

```
Authorization: Bearer {{token}}
```

---

## 6. Upload e Download de Arquivos

### 6.1 Upload de Logo

- **Método:** POST
- **URL:** `{{base_url}}/upload/logo`
- **Autenticação:** Sim (Admin)

**Headers:**

```
Authorization: Bearer {{token}}
```

**Body (form-data):** campo `file` (arquivo PNG)

### 6.2 Download de Arquivo

- **Método:** GET
- **URL:** `{{base_url}}/files/:filename`
- **Autenticação:** Não

---

## 7. Health Check

- **Método:** GET
- **URL:** `{{base_url}}/health`
- **Autenticação:** Não

---

## 8. Rotas de Reunião (Meeting)

### 8.1 Criar Reunião

- **Método:** POST
- **URL:** `{{base_url}}/meeting`
- **Autenticação:** Sim

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**

```json
{ "date": "YYYY-MM-DD", "timeSlot": "HH:mm", "userId": "<studentId>", "professorId": "<professorId>" }
```

**Passos:** novo request → POST → definir headers e body → Send.

### 8.2 Próxima Reunião (Aluno)

- **Método:** GET
- **URL:** `{{base_url}}/meeting/next?userId=<studentId>`
- **Autenticação:** Sim

**Headers:** `Authorization: Bearer {{token}}`

### 8.3 Próxima Reunião (Professor)

- **Método:** GET
- **URL:** `{{base_url}}/meeting/nextForProfessor`
- **Autenticação:** Sim

**Headers:** `Authorization: Bearer {{token}}`

### 8.4 Listar Todas as Reuniões (Admin/Prof)

- **Método:** GET
- **URL:** `{{base_url}}/meeting`
- **Autenticação:** Sim (professor/admin)

### 8.5 Listar Futuras para Professor

- **Método:** GET
- **URL:** `{{base_url}}/meeting/allFutureForProfessor`
- **Autenticação:** Sim (professor/admin)

### 8.6 Listar Todas para Estudante

- **Método:** GET
- **URL:** `{{base_url}}/meeting/allForStudent?userId=<studentId>`
- **Autenticação:** Sim

### 8.7 Listar Futuras para Estudante

- **Método:** GET
- **URL:** `{{base_url}}/meeting/allFutureForStudent?userId=<studentId>`
- **Autenticação:** Sim

### 8.8 Buscar Reunião por ID

- **Método:** GET
- **URL:** `{{base_url}}/meeting/:id`
- **Autenticação:** Sim

### 8.9 Atualizar Reunião

- **Método:** PATCH
- **URL:** `{{base_url}}/meeting/:id`
- **Autenticação:** Sim

**Body (JSON):** `UpdateMeetingDto`

### 8.10 Cancelar Reunião

- **Método:** PATCH
- **URL:** `{{base_url}}/meeting/:id/cancel`
- **Autenticação:** Sim

**Body:**

```json
{ "reason": "Motivo do cancelamento", "userId": "<studentId>" }
```

### 8.11 Deletar Reunião (Admin)

- **Método:** DELETE
- **URL:** `{{base_url}}/meeting/:id`
- **Autenticação:** Sim (Admin)

### 8.12 Deletar Todas as Reuniões (Admin)

- **Método:** DELETE
- **URL:** `{{base_url}}/meeting`
- **Autenticação:** Sim (Admin)

---

## 9. Rotas de Agenda (Schedule)

### 9.1 Listar Disponíveis por Data

- **Método:** GET
- **URL:** `{{base_url}}/schedule/available/:date`
- **Autenticação:** Não

### 9.2 Criar/Marcar Disponibilidade (Prof/Admin)

- **Método:** POST
- **URL:** `{{base_url}}/schedule`
- **Autenticação:** Sim (professor/admin)

**Body:**

```json
{ "date": "YYYY-MM-DD", "timeSlot": "HH:mm", "available": true|false, "professorId": "<professorId>" }
```

### 9.3 Listar Todas (Prof/Admin)

- **Método:** GET
- **URL:** `{{base_url}}/schedule`
- **Autenticação:** Sim (professor/admin)

### 9.4 Obter Agenda por ID

- **Método:** GET
- **URL:** `{{base_url}}/schedule/:id`
- **Autenticação:** Sim (professor/admin)

### 9.5 Atualizar Agenda

- **Método:** PATCH
- **URL:** `{{base_url}}/schedule/:id`
- **Autenticação:** Sim (professor/admin)

**Body:** `UpdateScheduleDto`

### 9.6 Remover Agenda (Prof/Admin)

- **Método:** DELETE
- **URL:** `{{base_url}}/schedule/:id`
- **Autenticação:** Sim (professor/admin)

### 9.7 Limpar Todas as Agendas (Admin)

- **Método:** DELETE
- **URL:** `{{base_url}}/schedule/clean`
- **Autenticação:** Sim (Admin)

---

## 10. Rotas de Usuário (User)

### 10.1 Criar Usuário

- **Método:** POST
- **URL:** `{{base_url}}/user`
- **Autenticação:** Não

**Body:** `CreateUserDto`

### 10.2 Listar Todos (Admin)

- **Método:** GET
- **URL:** `{{base_url}}/user`
- **Autenticação:** Sim (Admin)

### 10.3 Obter Usuário por ID

- **Método:** GET
- **URL:** `{{base_url}}/user/:id`
- **Autenticação:** Sim

### 10.4 Atualizar Usuário (Admin)

- **Método:** PATCH
- **URL:** `{{base_url}}/user/:id`
- **Autenticação:** Sim (Admin)

**Body:** `UpdateUserDto`

### 10.5 Atualizar Contato (Self/Admin)

- **Método:** PATCH
- **URL:** `{{base_url}}/user/:id/contato`
- **Autenticação:** Sim

**Body:** `UpdateContactDto`

### 10.6 Definir Admin (Admin)

- **Método:** PATCH
- **URL:** `{{base_url}}/user/:id/set-admin`
- **Autenticação:** Sim (Admin)

**Body:**

```json
{ "isAdmin": true|false }
```

### 10.7 Definir Professor (Admin)

- **Método:** PATCH
- **URL:** `{{base_url}}/user/:id/set-professor`
- **Autenticação:** Sim (Admin)

**Body:**

```json
{ "professor": true|false }
```

### 10.8 Deletar Usuário (Self/Admin)

- **Método:** DELETE
- **URL:** `{{base_url}}/user/:id`
- **Autenticação:** Sim

---

> **Dica:** Agrupe requisições em pastas por recurso (Auth, Meeting, Schedule, User) e exporte sua coleção para compartilhar.

