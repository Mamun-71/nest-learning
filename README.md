# NestJS Learning Project 🚀

A comprehensive NestJS project demonstrating best practices with MySQL, TypeORM, Authentication, Middleware, Guards, CRUD operations, and Business Logic.

## 📚 Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)
- [Key Concepts Explained](#key-concepts-explained)
  - [Modules](#1-modules)
  - [Controllers](#2-controllers)
  - [Services](#3-services)
  - [Entities (TypeORM)](#4-entities-typeorm)
  - [DTOs (Data Transfer Objects)](#5-dtos-data-transfer-objects)
  - [Authentication (JWT)](#6-authentication-jwt)
  - [Guards](#7-guards)
  - [Middleware](#8-middleware)
  - [Decorators](#9-decorators)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Testing the API](#testing-the-api)
- [Common Patterns](#common-patterns)
- [Best Practices](#best-practices)

---

## Project Overview

This project is a learning resource for NestJS beginners. It includes:

- ✅ **MySQL Database** with TypeORM
- ✅ **User Module** - Registration, profile management
- ✅ **Auth Module** - JWT authentication, login/logout
- ✅ **Products Module** - Full CRUD with business logic
- ✅ **Guards** - Role-based access control
- ✅ **Middleware** - Request logging, rate limiting
- ✅ **DTOs** - Request validation
- ✅ **Custom Decorators** - @Roles(), @CurrentUser(), @Public()

---

## Project Structure

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
├── app.controller.ts          # Root controller
├── app.service.ts             # Root service
│
├── auth/                      # Authentication module
│   ├── auth.module.ts         # Auth module definition
│   ├── auth.controller.ts     # Login, register, profile endpoints
│   ├── auth.service.ts        # JWT token generation, validation
│   ├── dto/
│   │   └── login.dto.ts       # Login request validation
│   ├── guards/
│   │   ├── jwt-auth.guard.ts  # Protects routes with JWT
│   │   └── local-auth.guard.ts# Handles login authentication
│   └── strategies/
│       ├── jwt.strategy.ts    # JWT token validation strategy
│       └── local.strategy.ts  # Username/password strategy
│
├── users/                     # Users module
│   ├── users.module.ts        # Users module definition
│   ├── users.controller.ts    # User CRUD endpoints
│   ├── users.service.ts       # User business logic
│   ├── dto/
│   │   ├── create-user.dto.ts # Create user validation
│   │   └── update-user.dto.ts # Update user validation
│   └── entities/
│       └── user.entity.ts     # User database entity
│
├── products/                  # Products module
│   ├── products.module.ts     # Products module definition
│   ├── products.controller.ts # Product CRUD endpoints
│   ├── products.service.ts    # Product business logic
│   ├── dto/
│   │   ├── create-product.dto.ts
│   │   ├── update-product.dto.ts
│   │   └── query-product.dto.ts
│   └── entities/
│       └── product.entity.ts  # Product database entity
│
└── common/                    # Shared module
    ├── common.module.ts       # Common module definition
    ├── decorators/
    │   ├── roles.decorator.ts      # @Roles() decorator
    │   ├── public.decorator.ts     # @Public() decorator
    │   └── current-user.decorator.ts # @CurrentUser() decorator
    ├── guards/
    │   └── roles.guard.ts     # Role-based access control
    └── middleware/
        ├── logging.middleware.ts    # HTTP request logging
        └── rate-limit.middleware.ts # Request throttling
```

---

## Environment Configuration

### `.env.example` Explained

Copy `.env.example` to `.env` and configure:

```bash
# Copy the example file
cp .env.example .env
```

### Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_PORT` | Server port number | `3000` |
| `DB_HOST` | MySQL server host | `localhost` |
| `DB_PORT` | MySQL server port | `3306` |
| `DB_USERNAME` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `your_password` |
| `DB_NAME` | Database name | `nest_learning` |
| `DB_SYNCHRONIZE` | Auto-sync entities (dev only!) | `true` |
| `JWT_SECRET` | Secret for JWT signing | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration | `1d` |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds | `10` |

### ⚠️ Important Notes:

1. **Never commit `.env` file** - It contains secrets!
2. **DB_SYNCHRONIZE=true** should only be used in development. In production, use migrations.
3. **JWT_SECRET** should be a long, random string in production.

---

## Key Concepts Explained

### 1. Modules

**What:** Modules organize your application into cohesive blocks of functionality.

**File:** `*.module.ts`

```typescript
@Module({
  imports: [],      // Other modules this module depends on
  controllers: [],  // Controllers that handle HTTP requests
  providers: [],    // Services and other injectable classes
  exports: [],      // Providers to share with other modules
})
export class UsersModule {}
```

**Key Points:**
- Every NestJS app has at least one module (AppModule)
- Feature modules encapsulate related functionality
- `@Global()` makes a module available everywhere without importing

### 2. Controllers

**What:** Controllers handle incoming HTTP requests and return responses.

**File:** `*.controller.ts`

```typescript
@Controller('users')  // Route prefix: /users
export class UsersController {
  constructor(private usersService: UsersService) {}  // Dependency injection

  @Get()              // GET /users
  findAll() { ... }

  @Get(':id')         // GET /users/123
  findOne(@Param('id') id: number) { ... }

  @Post()             // POST /users
  create(@Body() dto: CreateUserDto) { ... }

  @Patch(':id')       // PATCH /users/123
  update(@Param('id') id: number, @Body() dto: UpdateUserDto) { ... }

  @Delete(':id')      // DELETE /users/123
  remove(@Param('id') id: number) { ... }
}
```

**Parameter Decorators:**
- `@Param('id')` - URL parameter (e.g., `/users/123`)
- `@Body()` - Request body (POST/PATCH data)
- `@Query()` - Query parameters (e.g., `?page=1`)
- `@Headers()` - Request headers
- `@Request()` - Full Express request object

### 3. Services

**What:** Services contain business logic and data operations.

**File:** `*.service.ts`

```typescript
@Injectable()  // Required for dependency injection
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }
}
```

**Key Points:**
- `@Injectable()` - Marks class for dependency injection
- Services handle data processing, database operations
- Separation of concerns: Controllers → Services

### 4. Entities (TypeORM)

**What:** Entities map to database tables.

**File:** `*.entity.ts`

```typescript
@Entity('users')  // Table name
export class User {
  @PrimaryGeneratedColumn()  // Auto-increment primary key
  id: number;

  @Column({ unique: true })  // Unique column
  email: string;

  @Column({ type: 'varchar', length: 100 })  // Typed column
  firstName: string;

  @Column({ nullable: true })  // Optional column
  phone: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @CreateDateColumn()  // Auto-set on create
  createdAt: Date;

  @UpdateDateColumn()  // Auto-update on save
  updatedAt: Date;

  @ManyToOne(() => Company, (company) => company.users)  // Relationship
  company: Company;
}
```

**Column Types:**
- `varchar`, `text`, `int`, `decimal`, `boolean`, `datetime`, `enum`

**Relationships:**
- `@OneToOne` - One-to-one
- `@ManyToOne` / `@OneToMany` - One-to-many
- `@ManyToMany` - Many-to-many

### 5. DTOs (Data Transfer Objects)

**What:** DTOs define and validate incoming request data.

**File:** `*.dto.ts`

```typescript
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
```

**Common Validators:**
- `@IsEmail()` - Valid email format
- `@IsString()` - Must be string
- `@IsNumber()` - Must be number
- `@IsNotEmpty()` - Cannot be empty
- `@MinLength(n)` / `@MaxLength(n)` - Length constraints
- `@IsOptional()` - Field is optional
- `@IsEnum(Enum)` - Must be enum value
- `@Matches(regex)` - Must match pattern

### 6. Authentication (JWT)

**How JWT Auth Works:**

```
1. User Login
   POST /auth/login { email, password }
        ↓
2. Validate Credentials (LocalStrategy)
   - Find user by email
   - Compare password with hash
        ↓
3. Generate Token (AuthService)
   - Create JWT with user info
   - Sign with secret key
        ↓
4. Return Token
   { accessToken: "eyJhbG...", user: {...} }
        ↓
5. Client Stores Token
   localStorage or cookie
        ↓
6. Client Sends Token
   Authorization: Bearer eyJhbG...
        ↓
7. Validate Token (JwtStrategy)
   - Verify signature
   - Check expiration
   - Attach user to request
```

**Key Files:**
- `auth.service.ts` - Token generation, validation
- `local.strategy.ts` - Password validation
- `jwt.strategy.ts` - Token parsing
- `jwt-auth.guard.ts` - Route protection

### 7. Guards

**What:** Guards determine if a request should be handled.

**Execution Order:**
```
Middleware → Guards → Interceptors → Pipes → Handler
```

**JwtAuthGuard:**
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
```

**RolesGuard:**
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

**Usage:**
```typescript
@Get('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
adminOnly() { ... }
```

### 8. Middleware

**What:** Middleware runs before route handlers.

**File:** `*.middleware.ts`

```typescript
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.url}`);
    next();  // IMPORTANT: Must call next()
  }
}
```

**Configuration (in module):**
```typescript
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('*');  // Apply to all routes
  }
}
```

### 9. Decorators

**Custom Decorator - @Roles():**
```typescript
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// Usage
@Roles(UserRole.ADMIN)
```

**Custom Decorator - @CurrentUser():**
```typescript
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.user[data] : request.user;
  },
);

// Usage
getProfile(@CurrentUser() user: User) { ... }
getEmail(@CurrentUser('email') email: string) { ... }
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login and get token | ❌ |
| GET | `/auth/profile` | Get current user | ✅ |
| POST | `/auth/logout` | Logout | ✅ |

### Users

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/users` | List all users | ✅ | ADMIN/MOD |
| GET | `/users/:id` | Get user by ID | ✅ | - |
| GET | `/users/:id/stats` | Get user statistics | ✅ | - |
| PATCH | `/users/:id` | Update user | ✅ | - |
| DELETE | `/users/:id` | Delete user | ✅ | ADMIN |

### Products

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products` | List products (w/ filters) | ❌ |
| GET | `/products/:id` | Get product by ID | ❌ |
| GET | `/products/featured` | Get featured products | ❌ |
| GET | `/products/category/:cat` | Get by category | ❌ |
| POST | `/products` | Create product | ✅ |
| PATCH | `/products/:id` | Update product | ✅ |
| DELETE | `/products/:id` | Delete product | ✅ ADMIN |
| PATCH | `/products/:id/stock` | Update stock | ✅ |
| PATCH | `/products/:id/discount` | Apply discount | ✅ |
| GET | `/products/admin/stats` | Statistics | ✅ ADMIN |
| GET | `/products/admin/low-stock` | Low stock alert | ✅ ADMIN |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd nest-learning

# 2. Install dependencies
npm install

# 3. Create database
mysql -u root -p
CREATE DATABASE nest_learning;
exit;

# 4. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 5. Run the application
npm run start:dev
```

### Available Scripts

```bash
npm run start         # Start in production mode
npm run start:dev     # Start with hot-reload (development)
npm run start:debug   # Start with debugging
npm run build         # Build for production
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
```

---

## Testing the API

### Using curl

```bash
# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Get profile (use token from login response)
curl http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create a product
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Product",
    "price": 99.99,
    "description": "A test product",
    "category": "electronics"
  }'

# List products with filters
curl "http://localhost:3000/products?category=electronics&minPrice=50&page=1&limit=10"
```

### Using Postman

1. Import the provided Postman collection (if available)
2. Set environment variable `BASE_URL` to `http://localhost:3000`
3. After login, save the token to environment variable `TOKEN`
4. Use `{{TOKEN}}` in Authorization header for protected routes

---

## Common Patterns

### Pagination Response
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": ["email must be a valid email"],
  "error": "Bad Request"
}
```

### Success Response
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Best Practices

### 1. **Validation**
Always use DTOs with class-validator decorators to validate input.

### 2. **Error Handling**
Use built-in exceptions: `NotFoundException`, `BadRequestException`, `UnauthorizedException`, etc.

### 3. **Async/Await**
Always use async/await for database operations.

### 4. **Dependency Injection**
Let NestJS manage class instances through DI instead of creating them manually.

### 5. **Separation of Concerns**
- Controllers: Handle HTTP layer
- Services: Handle business logic
- Entities: Handle data structure

### 6. **Security**
- Never store plain passwords
- Use environment variables for secrets
- Validate all user input
- Use guards for authorization

### 7. **TypeORM**
- Use migrations in production (not synchronize)
- Use QueryBuilder for complex queries
- Select only needed fields

---

## 📖 Further Learning

- [NestJS Official Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Class Validator](https://github.com/typestack/class-validator)
- [Passport.js](http://www.passportjs.org/)

---

## 🤝 Contributing

Feel free to submit issues and pull requests!

## 📝 License

This project is licensed under the MIT License.
