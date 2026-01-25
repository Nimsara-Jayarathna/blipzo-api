# Blipzo API Documentation (All Versions)

This is a concise, generalized overview of the Blipzo API. For full request/response shapes and edge cases, refer to:
- v1.0.0 detailed docs: `docs/api/v1.0.0.md`
- v1.1.0 detailed docs: `docs/api/v1.1.0.md`

## Quick Facts
- **Base URLs:** v1.0.0 = `/api/v1`, v1.1.0 = `/api/v1.1`
- **Content type:** JSON request/response (except 204)
- **Auth:** HTTP-only cookies (`accessToken`, `refreshToken`)
- **Rate limits:** Global + per-endpoint (auth/email) with `RateLimit-*` headers

## Authentication Summary
- Tokens are set on register/login/refresh endpoints and cleared on logout.
- Access token cookie is required for all protected routes.
- v1.0 returns raw JSON on success and legacy errors.
- v1.1 returns standardized errors for all endpoints; new v1.1 endpoints also standardize success responses.

## Response Format Summary
- **v1.0 success:** Raw JSON payload (no envelope)
- **v1.0 errors:** `{ "message": "...", "errors"?: {...}, "stack"?: "..." }`
- **v1.1 success (new endpoints):** `{ "success": true, "message": "...", "data": {...} }`
- **v1.1 errors:** `{ "success": false, "error": { "code": "...", "message": "...", "details"?: {...} } }`
- **v1.1 inherited endpoints:** Raw JSON success, standardized error envelope

## Core Resource Overview
- **User:** identity + profile names + category defaults + currency
- **Category:** user or global, income/expense, default/active flags
- **Transaction:** income/expense with category, amount, date, status
- **Currency (v1.1):** list of supported currencies + per-user selection

## Endpoint Groups (Both Versions)

### Auth (v1.0 and v1.1 legacy)
- Register, login, get profile, get session, refresh, logout

### Categories (v1.0 and v1.1 legacy)
- List active, list all, create, set default, archive

### Transactions (v1.0 and v1.1 legacy)
- Create, create with custom date, list, summary, update, delete

## v1.1 Additions (Standardized)

### Registration Flow
- Init (send OTP), verify OTP, complete registration

### Password Management
- Forgot password, reset password, change password

### Email Change Flow
- Init, verify current email, request new email, confirm new email

### User Profile
- Update profile details

### Currency
- List currencies, update user currency

## Usage Notes (General)
- All protected routes require a valid `accessToken` cookie.
- Delete transaction requires a valid timezone and only allows deletion for "today".
- Category and transaction endpoints enforce validation on type/status and limits.

For complete parameter lists, validation rules, and example payloads, use the versioned docs linked above.
