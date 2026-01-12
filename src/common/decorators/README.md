# Common Decorators (`src/common/decorators`)

This directory contains custom decorators that simplify access to request data or attach metadata to routes.

## Key Files

### `current-user.decorator.ts`
A parameter decorator to access the authenticated user.
- **Usage**: `@CurrentUser() user: User`
- **Logic**: Extracts `request.user` (populated by authentication strategies) from the execution context. Can also extract specific properties like `@CurrentUser('email')`.

### `public.decorator.ts`
A method decorator to bypass authentication.
- **Usage**: `@Public()`
- **Logic**: Sets a metadata key (`isPublic`) to true. Guards check this metadata to allow access without a token.

### `roles.decorator.ts`
A decorator to specify required roles for a route.
- **Usage**: `@Roles(UserRole.ADMIN)`
- **Logic**: usage `SetMetadata` to attach an array of required roles to the route handler or controller class.
