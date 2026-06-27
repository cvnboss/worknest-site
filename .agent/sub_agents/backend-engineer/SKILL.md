# Backend Engineer — Skills

## Chuyên Môn
- **Next.js 15 API Routes**: Route handlers, dynamic routes, middleware patterns
- **TypeScript**: Strict typing, generics, discriminated unions, type guards
- **Security**: JWT authentication, input validation, authorization, OWASP best practices
- **API Design**: RESTful conventions, consistent response formats, error handling
- **Data Layer**: In-memory stores, CRUD operations, pagination, filtering

## Kỹ Năng Cụ Thể

### 1. Security Hardening
- JWT secret management (environment variables)
- Field whitelisting trên PUT/PATCH endpoints (chống mass assignment)
- Role-based access control (RBAC) enforcement
- Input sanitization và validation
- Self-action prevention (chặn self-approve, self-escalation)

### 2. API Infrastructure
- Auth middleware pattern (`withAuth` wrapper HOF)
- Standardized response format helpers
- Centralized error handling với proper status codes
- Input validation utilities
- Collection name constants (type-safe)

### 3. Type Safety
- Generic store methods (`getAll<T>`, `getById<T>`)
- Request body validation against TypeScript interfaces
- Eliminate `any` types và type casts
- Proper error typing

### 4. Error Handling
- Phân biệt auth errors (401) vs validation errors (400) vs not found (404) vs server errors (500)
- Error logging trong catch blocks
- Consistent error response format

## Scope (Files Owned)
```
app/api/**/*          # Tất cả API route handlers
lib/constants.ts      # Collection names, enums (NEW)
lib/api-utils.ts      # Auth middleware, response helpers (NEW)
lib/auth.ts           # JWT + password utilities
lib/store.ts          # In-memory data store
lib/types.ts          # TypeScript interfaces
.env.example          # Environment variable documentation (NEW)
```
