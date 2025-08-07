# 🚀 Laravel + React Starter Kit Installation Guide

```bash
# 🧱 1. Create a New Laravel Project
laravel new conansystem26
cd conansystem26

# 📦 2. Install Frontend Dependencies
npm install
npm run dev

# ⚙️ 3. Setup Environment Variables
cp .env.example .env
php artisan key:generate

# ✏️ Edit .env file and set the database credentials:
DB_CONNECTION=mysql
DB_HOST=109.106.244.162
DB_PORT=3306
DB_DATABASE=conansystem26
DB_USERNAME=root
DB_PASSWORD="MHDnor096###"

# 🗃️ 4. Run Database Migrations
php artisan migrate

# ✅ Done! You can now start the development server:
php artisan serve

# Open in browser:
http://localhost:8000

# 🧠 Notes:
- Built-in auth system (login/register/reset)

npm install @radix-ui/react-radio-group


سيسي
