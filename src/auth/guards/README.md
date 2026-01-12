# Auth Guards (`src/auth/guards`)

This directory contains NestJS Guards used to protect routes based on authentication strategies. Guards determine whether a request should be handled by the route handler.

## Key Files

### `jwt-auth.guard.ts`
A guard that protects routes requiring a valid JWT token.
- **Inheritance**: Extends `AuthGuard('jwt')` from `@nestjs/passport`.
- **Functionality**:
    - Validates the `Authorization: Bearer <token>` header.
    - Uses `JwtStrategy` to verify the token.
    - **`handleRequest`**: Custom error handling logic to throw specific `UnauthorizedException` messages for expired or invalid tokens.

### `local-auth.guard.ts`
A guard used specifically for the login route.
- **Inheritance**: Extends `AuthGuard('local')` from `@nestjs/passport`.
- **Functionality**:
    - Triggers the `LocalStrategy` to validate email and password from the request body.
    - **`handleRequest`**: Ensures a user object is returned or throws `UnauthorizedException` if credentials are invalid.
