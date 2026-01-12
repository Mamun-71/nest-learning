# Common Filters (`src/common/filters`)

This directory contains exception filters that process unhandled exceptions across the application.

## Key Files

### `http-exception.filter.ts`
The global exception filter (`AllExceptionsFilter`).
- **Purpose**: Catches all exceptions (HttpException and others) to ensure a consistent JSON error response format.
- **Features**:
    - Standardization: Returns errors with `statusCode`, `timestamp`, `path`, `method`, and `error` message.
    - Logging: Logs the error details and stack trace to the console for debugging.
    - Safety: Handles non-HTTP errors by returning a generic 500 Internal Server Error.
