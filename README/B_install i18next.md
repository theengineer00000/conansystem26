# Install React i18n libraries for multi-language support in React
npm install react-i18next i18next i18next-http-backend i18next-browser-languagedetector --save

# Install all Node.js dependencies from package.json
npm install

# Run Vite/React development server
npm run dev

# Install Lodash utility library for arrays, objects, and strings manipulation
npm install lodash

# Install all Node.js dependencies from package.json again (after adding Lodash)
npm install

# Run Vite/React development server again
npm run dev

# Install Flysystem AWS S3 adapter for Laravel (used for S3/R2 file storage)
composer require league/flysystem-aws-s3-v3:^3.0

# Clear Laravel configuration cache
php artisan config:clear
# Clear Laravel application cache
php artisan cache:clear
# Clear all Laravel caches (config, route, view, etc.)
php artisan optimize:clear

# Check if the Flysystem AWS S3 class exists (should return "yes")
php -r "require 'vendor/autoload.php'; echo class_exists(League\\Flysystem\\AwsS3V3\\PortableVisibilityConverter::class) ? 'yes' : 'no';"

# Install PHP GD library with WebP support (image processing)
sudo apt-get install php8.3-gd
# Restart Apache web server to apply changes
sudo systemctl restart apache2
# Verify WebP support in PHP
php -i | grep -i webp
