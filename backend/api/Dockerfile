FROM php:8.2-apache

# Instalar dependencias para PostgreSQL e extensoes PHP necessarias
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Ativar mod_rewrite do Apache (util para APIs)
RUN a2enmod rewrite

# Configurar o diretório de trabalho
WORKDIR /var/www/html

# Copiar os ficheiros do backend para o contentor
COPY . /var/www/html/

# Ajustar permissoes para a pasta de uploads
RUN mkdir -p uploads/avatars uploads/media && \
    chmod -R 777 uploads

# O Apache corre por defeito na porta 80, que mapeamos no docker-compose
EXPOSE 80
