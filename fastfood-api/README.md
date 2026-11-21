# FastFood POS — Backend API

Laravel REST API for the FastFood order-management system.

## Requirements

- PHP 8.2+ (XAMPP)
- Composer
- MySQL / MariaDB (XAMPP default: `127.0.0.1`, user `root`, empty password)

## Setup

```bash
cd C:\xampp\htdocs\fastfood-api
composer install

# Configure MySQL credentials in .env (database: fastfood)
cp .env.example .env
php artisan key:generate

# Create the database, run migrations and seed default users + menu
mysql -u root -e "CREATE DATABASE fastfood CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate --seed
```

## Default users (seeded)

| Role  | Email                | Password |
|-------|----------------------|----------|
| Admin | admin@fastfood.test  | password |
| Staff | staff@fastfood.test  | password |

## Run the API

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

The frontend Vite dev server proxies `/api` to this address.

## API Endpoints

Authentication (Sanctum tokens):

- `POST /api/login`
- `POST /api/logout` (auth)
- `GET /api/me` (auth)

Menus (writes require `role:admin`):

- `GET /api/menus` · `POST /api/menus` · `GET /api/menus/{id}` · `PUT /api/menus/{id}` · `DELETE /api/menus/{id}`

Orders:

- `GET /api/orders` (filters: `date`, `date_from`, `date_to`, `status`, `payment_status`)
- `POST /api/orders` · `GET /api/orders/{id}` · `PUT /api/orders/{id}`

Kitchen:

- `GET /api/kitchen/orders`
- `PUT /api/kitchen/orders/{id}/status`  (`{"status": "new|preparing|completed"}`)

Dashboard & Reports (admin only):

- `GET /api/dashboard`
- `GET /api/reports/sales?period=today|yesterday|week|month|custom&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD`

Users (admin only):

- `GET /api/users` · `POST /api/users` · `PUT /api/users/{id}` · `DELETE /api/users/{id}`

## Testing

```bash
php artisan test
```

Feature tests use an in-memory SQLite database and cover auth, menu management,
order creation/transactions, kitchen workflow, payment recording, dashboard and reports.