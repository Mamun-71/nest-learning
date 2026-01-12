# Auth Strategies (`src/auth/strategies`)

This directory contains Passport.js strategies that implement the actual authentication logic.

## Key Files

### `jwt.strategy.ts`
Implements the JWT authentication strategy.
- **Purpose**: Verifies the validity of a JWT token on protected routes.
- **Configuration**:
    - Extracts token from the `Authorization` header as a Bearer token.
    - Uses the `JWT_SECRET` from environment variables to verify the signature.
    - Rejects expired tokens.
- **`validate(payload)`**: Called after successful token verification. It validates that the user identified by the token still exists and is active by querying the database via `AuthService`.

### `local.strategy.ts`
Implements the local (username/password) authentication strategy.
- **Purpose**: Validates user credentials during login.
- **Configuration**: Customizes the default username field to be `email`.
- **`validate(email, password)`**: Calls `AuthService.validateUser()` to check if the email exists and the password matches the hash. Returns the user object on success or throws `UnauthorizedException`.
