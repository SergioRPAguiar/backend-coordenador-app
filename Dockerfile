# Use a imagem oficial do Node.js
FROM node:18-alpine

# Instale as ferramentas de compilação necessárias (python, make, g++)
RUN apk add --no-cache python3 make g++ bash

# Defina o diretório de trabalho no container
WORKDIR /usr/src/app

# Copie os arquivos de dependência do Node.js
COPY package*.json ./

# Instale as dependências
RUN npm install

# Recompile as dependências nativas para o ambiente do container
RUN npm rebuild bcrypt --build-from-source

# Copie o restante do código da aplicação
COPY . .

# Compile o código TypeScript, se necessário
RUN npm run build

# Exponha a porta da aplicação
EXPOSE 3000

RUN npm install && npm cache clean --force
# Comando para iniciar a aplicação
CMD ["npm", "run", "start"]
