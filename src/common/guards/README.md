# Common Guards (`src/common/guards`)

This directory stores shared guards that enforce access control logic.

## Key Files

### `roles.guard.ts`
Implements Role-Based Access Control (RBAC).
- **Dependency**: Uses `Reflector` to read metadata set by the `@Roles()` decorator.
- **Logic**:
    1. Checks if the route requires any roles. If not, access is granted.
    2. Retrieves the user from the request (must be authenticated first).
    3. Verifies if the user's role is included in the required roles.
    4. Returns `true` (allow) or `false` (deny, resulting in 403 Forbidden).
