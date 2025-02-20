# Use a imagem oficial do Node.js com versão 20
FROM node:20-alpine

# Configuração do timezone para Campo Grande/MS
RUN apk add --no-cache tzdata
ENV TZ=America/Campo_Grande

# Instale as dependências necessárias incluindo openssl
RUN apk add --no-cache python3 make g++ bash openssl

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

# Compile o código TypeScript
RUN npm run build

# Exponha a porta da aplicação
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]
