# Common Module (`src/common`)

This directory acts as a library for the application, hosting shared resources that can be used across multiple feature modules. It follows the principle of write once, use everywhere.

## Key Files

### `common.module.ts`
The definition file for the shared module.
- **Global Scope**: Decorated with `@Global()`, making its providers and exports available to all other modules without needing explicit imports.
- **Middleware Usage**: Implements `NestModule` to configure and apply middleware (like `LoggingMiddleware` and `RateLimitMiddleware`) to application routes.
- **Exports**: Exports shared guards (like `RolesGuard`) so they can be used throughout the app.

## Directory Structure
- **`decorators/`**: Custom parameter and method decorators.
- **`filters/`**: Global exception filters for consistent error handling.
- **`guards/`**: Reuseable guards (e.g., for Role-Based Access Control).
- **`middleware/`**: Express-style middleware for request processing.
