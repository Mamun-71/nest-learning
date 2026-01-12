# 🧠 NestJS Code Logic & Structure Explained

This document breaks down every major part of the codebase to help you understand **HOW** and **WHY** things are implemented the way they are.

---

## 1. Request Lifecycle (What happens when you hit an API?)

When you make a request (e.g., `POST /auth/login`), it flows through these steps:

1.  **Middleware** (`LoggingMiddleware`) - Intercepts request, logs it.
2.  **Guards** (`LocalAuthGuard`) - Checks if you are allowed (validates password).
3.  **UseGlobalPipes** (`ValidationPipe`) - Validates your data (is email valid?).
4.  **Controller** (`AuthController`) - Routes the request to the right method.
5.  **Service** (`AuthService`) - Handles business logic (generates JWT).
6.  **Exception Filter** (`AllExceptionsFilter`) - Catches logic errors (creates error response).
7.  **Response** - Sends JSON back to you.

---

## 2. Main Application (`src/main.ts`)

This is the entry point. It "bootstraps" (starts) the app.

```typescript
// Create the app
const app = await NestFactory.create(AppModule);

// 1. GLOBAL VALIDATION
// This ensures NO bad data enters your app.
// whitelist: true -> Strips out fields not in your DTO (security!)
app.useGlobalPipes(new ValidationPipe({ whitelist: true, ... }));

// 2. GLOBAL ERROR HANDLING
// This catches crash errors and formats them nicely for the user.
app.useGlobalFilters(new AllExceptionsFilter());

// 3. START SERVER
await app.listen(3000);
```

---

## 3. Database Connection (`src/app.module.ts`)

We use `TypeOrmModule` to connect to MySQL.

**Key Config:**
- `forRootAsync`: We use "Async" because we need to wait for `.env` file to load.
- `synchronize: true`: **DANGEROUS!** It auto-creates tables. Great for learning, bad for production (might delete data).
- `entities`: Tells TypeORM where your table definitions are (`dist/**/*.entity.js`).

---

## 4. Understanding DTOs (Data Transfer Objects)

DTOs are just classes that define "What data I expect".

**Example: `CreateUserDto`**
```typescript
export class CreateUserDto {
  @IsEmail() // Validator: Must be email format
  email: string;

  @MinLength(8) // Validator: Password must be 8+ chars
  password: string;
}
```
If a user sends a 3-character password, NestJS automatically rejects it with "400 Bad Request" before it even reaches your code!

---

## 5. Authentication Flow (The Hard Part Explained)

We use **Passport.js** with two strategies:

### A. Login (Local Strategy)
**Scenario:** User sends Email + Password.
1.  **`AuthController.login()`** is called.
2.  **`@UseGuards(LocalAuthGuard)`** activates.
3.  It calls **`LocalStrategy.validate()`**.
4.  Strategy calls **`AuthService.validateUser()`**:
    - Finds user in DB.
    - Hashes input password & compares with DB hash.
    - Returns user if match.
5.  Controller returns **JWT Token**.

### B. Accessing Protected Route (JWT Strategy)
**Scenario:** User sends `Authorization: Bearer <token>`.
1.  **`@UseGuards(JwtAuthGuard)`** activating.
2.  It calls **`JwtStrategy.validate()`**.
3.  Strategy decodes token, makes sure it's valid & not expired.
4.  It attaches the user to `req.user`.
5.  Your controller can now use `@CurrentUser()` or `req.user`.

---

## 6. Dependency Injection (The "Magical" Constructor)

You'll see this everywhere:

```typescript
constructor(private readonly usersService: UsersService) {}
```

**Why?**
Instead of `const service = new UsersService()`, we ask NestJS to give it to us.
- **Benefit:** Testing is easy (we can mock the service).
- **Benefit:** Memory efficient (Nest creates only 1 instance and shares it).

---

## 7. Migration Setup (Why & How)

**Why not just use synchronize?**
`synchronize: true` looks at your entities and blindly changes the DB. If you rename a column, it might **drop the column and lose data**.

**Migrations:**
Migrations are scripts like "Create table users", "Add column age". They are version usage control for your DB.

**Commands:**
1.  `npm run migration:generate -- name` -> Looks at code, looks at DB, generates SQL to match them.
2.  `npm run migration:run` -> Executes the SQL.
3.  `npm run migration:revert` -> Undoes the last change.

**Configuration (`data-source.ts`):**
This file tells the Migration CLI how to connect to various DBs (since the app isn't running during migration generation).

---

## 8. Custom Decorators

We made `@CurrentUser()` to simplify code:

**Without Decorator:**
```typescript
getProfile(@Request() req) {
  return req.user; // Typeless, 'any' type
}
```

**With Decorator:**
```typescript
getProfile(@CurrentUser() user: User) {
  return user; // Typed, clean, easy to read
}
```

---

## 9. Middleware (`LoggingMiddleware`)

Runs before **EVERYTHING**.
- We use it to log: `POST /auth/register - 201 Created - 45ms`.
- Helps debugging: "Did the request even reach my server?"

---

## Debugging Tips for NestJS

1.  **404 Not Found**:
    - Did you register the Controller in the Module? (`controllers: [AuthController]`)
    - Did you import the Module in `app.module.ts`?
    - Check the route prefix. (`@Controller('auth')` + `@Post('login')` = `/auth/login`)

2.  **Dependency Injection Errors**:
    - "Nest can't resolve dependencies of X"?
    - **Sol:** Check if you imported the Module that exports the service you need.
    - **Example:** `AuthModule` uses `UsersService` -> `AuthModule` MUST import `UsersModule`, and `UsersModule` MUST export `UsersService`.

3.  **TypeORM Errors**:
    - "RepositoryNotFoundError"?
    - **Sol:** Did you add `TypeOrmModule.forFeature([Entity])` in the module?

4.  **Use the Terminal Logs**:
    - Our custom `main.ts` and `ExceptionFilter` will print detailed errors. Always check the terminal first!
