# Cart Management Service

Express.js service providing shopping cart APIs backed by PostgreSQL.

Features:
- API key authentication via X-API-KEY header
- CRUD operations on cart items
- Real-time total calculation
- PostgreSQL persistence with SQL migrations
- Swagger docs at /docs

## Quick start

1) Install dependencies
   npm install

2) Configure environment
   cp .env.example .env
   # edit values, especially API_KEY and DB settings

3) Run migrations
   npm run migrate

4) Start service
   npm run dev
   # or
   npm start

Swagger docs: http://localhost:${PORT}/docs

## API

- GET /cart
- POST /cart
- PUT /cart
- DELETE /cart

Headers:
- X-API-KEY: required
- X-CART-ID: optional explicit cart identifier (defaults to cart:<api_key>)

## Database

Tables:
- carts(id, cart_key)
- cart_items(cart_id, product_id, quantity, unit_price)

Migrations are in migrations/ and tracked in _migrations.

## Environment variables

See .env.example for full list.
