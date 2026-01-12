# Authentication Module (`src/auth`)

This module handles all authentication mechanisms for the application, primarily focused on JWT (JSON Web Tokens) and Local (Username/Password) authentication strategies.

## Key Files

### `auth.module.ts`
The module definition file.
- **Imports**: `UsersModule` (for user data), `PassportModule` (for auth strategies), and `JwtModule` (for token generation).
- **Configuration**: Configures JWT with secret keys and expiration times loaded from environment variables.
- **Providers**: Registers `AuthService` and auth strategies (`LocalStrategy`, `JwtStrategy`).

### `auth.controller.ts`
Handles authentication endpoints.
- **`POST /auth/register`**: Registers a new user (delegates to `UsersService`).
- **`POST /auth/login`**: Authenticates user credentials using `LocalAuthGuard` and returns a JWT token.
- **`GET /auth/profile`**: Returns the currently authenticated user's profile (protected by `JwtAuthGuard`).
- **`POST /auth/logout`**: Handles logout (client-side token removal pattern).

### `auth.service.ts`
Contains the core authentication logic.
- **`validateUser(email, password)`**: Verifies user credentials using `bcrypt` to compare hashes.
- **`login(user)`**: Generates and returns a signed JWT token containing user ID and role.
- **`validateJwtPayload(payload)`**: Verifies that the user identified by the token still exists and is active.

## Authentication Flow
1. **Login**: User submits credentials -> `LocalStrategy` verifies them -> `AuthService` generates JWT -> Client receives Token.
2. **Protected Requests**: Client sends Token in Header -> `JwtStrategy` verifies Token -> Request proceeds with `req.user` populated.

## Subdirectories
- **`dto/`**: Data Transfer Objects for authentication requests (e.g., `LoginDto`).
- **`guards/`**: NestJS Guards to protect routes (`LocalAuthGuard`, `JwtAuthGuard`).
- **`strategies/`**: Passport strategies implementation (`LocalStrategy`, `JwtStrategy`).
