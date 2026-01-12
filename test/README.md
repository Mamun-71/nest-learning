# End-to-End Tests (`test`)

This directory contains configuration and specifications for End-to-End (e2e) testing.

## Key Files

### `app.e2e-spec.ts`
An example e2e test suite for the root application controller.
- **Workflow**:
    1. Compiles the full `AppModule` (replicating the real application environment).
    2. Initializes a NestJS application instance.
    3. Uses `supertest` to simulate an HTTP GET request to `/`.
    4. Expects a `200 OK` status and "Hello World!" response body.

### `jest-e2e.json`
Configuration file for running e2e tests with Jest.
- **Settings**:
    - `testRegex`: Looks for files ending in `.e2e-spec.ts`.
    - `transform`: Uses `ts-jest` to compile TypeScript files before testing.
