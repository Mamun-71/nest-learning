# Users Feature (`src/users`)

This module manages everything related to user accounts, including profiles, roles, and administrative actions.

## Key Files

### `users.module.ts`
The specific feature module for users.
- **Imports**: `TypeOrmModule.forFeature([User])` to register the User entity.
- **Exports**: `UsersService` to allow the Auth module to access user data during login.

### `users.controller.ts`
Handles HTTP requests for user data.
- **Public Routes**: creating a user (`POST /`, i.e., registration).
- **Protected Routes**: Fetching single user, updating user, getting stats (require JWT).
- **Admin Routes**: Listing all users (`GET /`) and deleting users (require ADMIN/MODERATOR role).

### `users.service.ts`
Contains the core business logic.
- **Authentication**: `validateUser()` and hashing logic.
- **CRUD**:
    - `create()`: Checks for unique email, hashes password, saves user.
    - `findAll()`: Returns selected fields (excluding passwords).
    - `update()`: Handles profile updates safely.
    - `remove()`: Implements soft deletion (setting `isActive = false`).
- **Logic**: `getUserStatistics()` calculates account age and product counts.

## Directory Structure
- **`dto/`**: Data Transfer Objects for user creation (`CreateUserDto`) and updates (`UpdateUserDto`).
- **`entities/`**: The TypeORM `User` entity definition.
