FROM php:8.4-cli

# 1. System dependencies at SQLite / MySQL extensions
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    nodejs \
    npm \
    sqlite3 \
    libsqlite3-dev \
    && docker-php-ext-install zip pdo pdo_sqlite pdo_mysql

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

# 2. Dependencies at Asset Build
RUN composer install --no-dev --optimize-autoloader
RUN npm install && npm run build

# 3. Gumawa ng SQLite file at i-ayos ang write permissions
RUN mkdir -p /var/www/database \
    && touch /var/www/database/database.sqlite \
    && chmod -R 777 /var/www/storage /var/www/bootstrap/cache /var/www/database

EXPOSE 8000

# 4. Patakbuhin ang database migration bago mag-serve
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}