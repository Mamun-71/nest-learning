# Auth DTOs (`src/auth/dto`)

This directory contains Data Transfer Objects (DTOs) related to authentication. DTOs define the shape of data sent over the network and are used for validation.

## Key Files

### `login.dto.ts`
Defines the expected payload for the login endpoint.
- **Fields**:
    - `email`: Must be a valid email address, required.
    - `password`: Must be a non-empty string, required.
- **Validation**: Uses `class-validator` decorators (`@IsEmail`, `@IsNotEmpty`, `@IsString`) to ensure data integrity before processing.
