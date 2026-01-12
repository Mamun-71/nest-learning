# Source Directory (`src`)

This directory contains the core source code for the NestJS application. It is the root folders where all the application logic, modules, controllers, and services reside.

## Key Files

### `main.ts`
The entry point of the application.
- **Bootstrapping**: Uses `NestFactory` to create the application instance.
- **Configuration**: Sets up global pipes (validation), global filters (exception handling), and CORS.
- **Startup**: Listens on the configured port (default: 3000).

### `app.module.ts`
The root module of the application.
- **Imports**: Connects all feature modules (`AuthModule`, `UsersModule`, `ProductsModule`, `CommonModule`).
- **Configuration**: Sets up `TypeOrmModule` for database connection (MySQL) and `ConfigModule` for environment variables.
- **Providers**: Registers the main `AppService`.

### `app.controller.ts`
The root controller handling basic routes.
- **Endpoints**:
    - `GET /`: Returns a welcome message.
    - `GET /health`: Health check endpoint returns status and timestamp.

### `app.service.ts`
The root service containing basic business logic.
- **`getHello()`**: Returns the welcome string used by the controller.

## Directory Structure
- **`auth/`**: Authentication module (Login, Register, JWT, Guards).
- **`common/`**: Shared resources (Decorators, Filters, Guards, Middleware).
- **`products/`**: Product management feature (CRUD operations).
- **`users/`**: User management feature (Entities, Services).
