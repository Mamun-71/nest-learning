# User DTOs (`src/users/dto`)

This directory contains Data Transfer Objects (DTOs) for user-related operations, ensuring data integrity through validation.

## Key Files

### `create-user.dto.ts`
Schema for user registration.
- **Validation**:
    - `email`: Must be valid and unique.
    - `password`: Enforces complexity (mix of case and numbers) and minimum length (8 chars).
    - `firstName`, `lastName`: Required strings.
    - `role`: Optional enum (defaults to 'user').

### `update-user.dto.ts`
Schema for updating user details.
- **Structure**: All fields are optional to allow partial updates (e.g., changing just the phone number).
- **Validation**: Reuses validation logic for email, names, and role, plus adds a validator for `isActive` (boolean).
