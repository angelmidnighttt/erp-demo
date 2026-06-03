# ERP Demo — NestJS Microservices

Three independent NestJS services communicating over HTTP.

```
                       ┌─────────────────────┐
  client  ──login──►   │   api-gateway :3000 │
                       │  (public entry)     │
                       └──────────┬──────────┘
              proxy /auth/login   │   POST /auth/validate (token check)
                       ┌──────────▼──────────┐
                       │  auth-service :3001 │  ── signs & verifies JWT
                       └──────────┬──────────┘
            POST /users/validate-credentials
                       ┌──────────▼──────────┐
                       │  user-service :3002 │  ── users + bcrypt passwords
                       └─────────────────────┘
```

| Service | Port | Responsibility |
|---|---|---|
| **api-gateway** | 3000 | Public entry point. Proxies `/auth/login`; protects `/users/*` with a guard that validates the token via auth-service, then forwards the request. |
| **auth-service** | 3001 | `POST /auth/login` (checks credentials via user-service, signs a JWT) and `POST /auth/validate` (verifies a JWT). Holds the JWT secret. |
| **user-service** | 3002 | In-memory users with bcrypt-hashed passwords. `POST /users/validate-credentials` (internal), `GET /users`, `GET /users/:id`. |

## Token flow

1. Client `POST /auth/login` → gateway → **auth-service**.
2. auth-service asks **user-service** to verify username/password (bcrypt).
3. auth-service signs a JWT (`{ sub, username, roles }`) and returns it.
4. Client calls a protected route, e.g. `GET /users`, with `Authorization: Bearer <token>`.
5. The gateway's `JwtAuthGuard` calls **auth-service** `POST /auth/validate` to verify the token.
6. If valid, the gateway attaches the decoded user to the request and proxies to **user-service** (forwarding `x-user-id` / `x-user-roles`).

> The JWT secret lives **only** in the auth-service. The gateway never verifies tokens itself — it delegates (token introspection). Set the same `JWT_SECRET` in `auth-service/.env` for both signing and verifying.

## Run

Open **three terminals** (start order doesn't strictly matter, but this is cleanest):

```powershell
# Terminal 1
cd user-service ; npm install ; npm run start:dev

# Terminal 2
cd auth-service ; npm install ; npm run start:dev

# Terminal 3
cd api-gateway ; npm install ; npm run start:dev
```

## Demo users

| username | password | roles |
|---|---|---|
| `admin` | `admin123` | admin |
| `john`  | `john123`  | user |

## Try it (PowerShell)

```powershell
# 1. Login through the gateway
$res = Invoke-RestMethod -Uri http://localhost:3000/auth/login -Method Post `
  -ContentType "application/json" `
  -Body (@{ username = "admin"; password = "admin123" } | ConvertTo-Json)
$token = $res.access_token
$token

# 2. Call a protected route with the token
Invoke-RestMethod -Uri http://localhost:3000/users -Method Get `
  -Headers @{ Authorization = "Bearer $token" }

# 3. Who am I (decoded from token at the gateway)
Invoke-RestMethod -Uri http://localhost:3000/users/me -Method Get `
  -Headers @{ Authorization = "Bearer $token" }

# 4. Without a token → 401 Unauthorized
Invoke-RestMethod -Uri http://localhost:3000/users -Method Get
```

## Try it (curl)

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r .access_token)

curl http://localhost:3000/users -H "Authorization: Bearer $TOKEN"
```

## Notes for production

- Replace the in-memory user store with a real DB (TypeORM / Prisma).
- Move secrets out of `.env` into a secrets manager.
- Consider TCP/gRPC or a message broker (`@nestjs/microservices`) instead of HTTP between services.
- Add refresh tokens, rate limiting, and caching of token-validation results at the gateway.
