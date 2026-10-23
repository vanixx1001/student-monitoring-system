# Multi-stage build: Frontend + Backend para sa Laravel 11 at React
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM php:8.4-cli-alpine
WORKDIR /var/www/html

# I-install ang mga kailangang system tools at PHP extensions para sa MySQL
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    sqlite-dev \
    mariadb-connector-c-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite mbstring bcmath

# Kunin ang Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Kopyahin ang code ng project
COPY . .
COPY --from=frontend /app/public/build ./public/build

# I-install ang production PHP packages
RUN composer install --no-dev --optimize-autoloader --no-interaction

# I-set ang tamang permissions sa storage at bootstrap/cache
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8000

# Awtomatikong mag-migrate at mag-seed sa Aiven MySQL bago simulan ang web server
CMD php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}