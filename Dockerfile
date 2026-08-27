FROM php:8.3-apache

RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm \
    && apt-get clean

RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY . /var/www/html

COPY database/database.sqlite /var/www/html/database/database.sqlite

# Permisos correctos desde el BUILD
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

RUN a2enmod rewrite

RUN composer install --no-interaction --optimize-autoloader --no-dev
RUN npm install --legacy-peer-deps && npm run build

# Crear base de datos con permisos correctos
RUN mkdir -p /var/www/html/storage \
    && cp /var/www/html/database/database.sqlite /var/www/html/storage/database.sqlite \
    && chown -R www-data:www-data /var/www/html/storage \
    && chmod -R 775 /var/www/html/storage \
    && php artisan migrate --force || true

# Crear .env
RUN echo "APP_ENV=production" > /var/www/html/.env \
    && echo "APP_DEBUG=false" >> /var/www/html/.env \
    && echo "APP_KEY=base64:2z7bDiQNavSIDL3dQsct9WegO5OfSqjWvUdDw8pzPCg=" >> /var/www/html/.env \
    && echo "APP_URL=https://antillas-premier-league.onrender.com" >> /var/www/html/.env \
    && echo "DB_CONNECTION=sqlite" >> /var/www/html/.env \
    && echo "DB_DATABASE=/var/www/html/storage/database.sqlite" >> /var/www/html/.env \
    && chown www-data:www-data /var/www/html/.env

# Configurar Apache para public
RUN sed -i 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf \
    && sed -i 's!/var/www/html!/var/www/html/public!g' /etc/apache2/apache2.conf \
    && a2enmod rewrite

EXPOSE 80

# Forzar que Vite use HTTPS
RUN echo "VITE_APP_URL=https://antillas-premier-league.onrender.com" >> /var/www/html/.env
# CMD simple (los permisos ya están en el BUILD)
CMD ["sh", "-c", "php artisan migrate --force || true && /usr/sbin/apache2ctl -D FOREGROUND"]