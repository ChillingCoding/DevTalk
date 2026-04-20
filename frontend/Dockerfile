# Stage 1: Build do React/Vite
FROM node:22-alpine as build-stage

WORKDIR /app

# Argumento para o URL da API (pode ser passado no docker-compose)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copiar ficheiros de dependencia
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar o resto do código
COPY . .

# Fazer o build de producao
RUN npm run build

# Stage 2: Servir com Nginx
FROM nginx:stable-alpine

# Copiar o build do stage anterior
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copiar configuracao costumizada do Nginx para tratar SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
