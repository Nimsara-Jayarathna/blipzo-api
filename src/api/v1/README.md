# Blipzo API v1

This directory contains the version 1 API endpoints for the Blipzo application.

## Endpoints

Protected routes read access tokens from HttpOnly cookies (CORS credentials enabled).

### Auth
- `POST /api/v1/auth/register` — body: `fname`, `lname`, `email`, `password` (optional `name`)
- `POST /api/v1/auth/login` — body: `email`, `password`
- `GET /api/v1/auth/me` — current user profile
- `GET /api/v1/auth/session` — validate access cookie and return `{ user }`
- `POST /api/v1/auth/refresh` — rotate access/refresh cookies or 401/419
- `POST /api/v1/auth/logout` — clear auth cookies

### Categories
- `GET /api/v1/categories/active?type=income|expense` — list all active categories (user + global); if `type` is provided, only that type
- `GET /api/v1/categories/all?type=income|expense` — list all categories (active + inactive, user + global); if `type` is provided, only that type
- `POST /api/v1/categories` — body: `name`, `type`
- `PATCH /api/v1/categories/:id` — body: `isDefault=true` to set the default category for that type (also updates user defaults)
- `DELETE /api/v1/categories/:id` — soft-archive (defaults cannot be removed)

### Transactions
- `POST /api/v1/transactions` — body: `type`, `amount`, optional `category` or `categoryId`, `title`, `description`, `status`, optional `date` (uses provided date and marks `isCustomDate=true`)
- `POST /api/v1/transactions/custom` — same as above with `date` required
- `GET /api/v1/transactions?status=active|undone` — list for user
- `GET /api/v1/transactions/summary` — income/expense totals + weekly/monthly/yearly breakdowns
- `PUT /api/v1/transactions/:id` — update fields (type/category/date/etc.)
- `DELETE /api/v1/transactions/:id` — delete

### Misc
- `GET /` — ping
- `GET /health` — uptime/status
