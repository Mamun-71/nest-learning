# User Entities (`src/users/entities`)

This directory contains the database model for the User feature.

## Key Files

### `user.entity.ts`
Defines the `User` table schema using TypeORM.
- **Columns**: `email` (unique), `password` (excluded from JSON responses), `firstName`, `lastName`, `role`, `isActive`, `phone`.
- **Enums**: `UserRole` (user, admin, moderator) defines permission levels.
- **Relationships**: A OneToMany relationship with `Product` (`products` property), representing items created by the user.
- **Virtual Properties**: `fullName` (combines first and last name).
