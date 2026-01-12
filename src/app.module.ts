/**
 * ============================================
 * APP.MODULE.TS - Root Module
 * ============================================
 *
 * This is the ROOT MODULE of your NestJS application.
 * Think of it as the "main hub" that connects all other modules.
 *
 * IMPORTANT CONCEPTS:
 *
 * 1. @Module() Decorator
 *    - Organizes your application into logical pieces
 *    - Has 4 main properties:
 *      - imports: Other modules this module depends on
 *      - controllers: Controllers that handle HTTP requests
 *      - providers: Services and other injectable classes
 *      - exports: Providers to share with other modules
 *
 * 2. Dependency Injection (DI)
 *    - NestJS automatically creates instances of classes
 *    - You just declare what you need, Nest handles the rest
 *
 * 3. ConfigModule
 *    - Loads environment variables from .env file
 *    - Makes them available throughout the application
 *
 * 4. TypeOrmModule
 *    - Connects to your MySQL database
 *    - Manages database entities and repositories
 */

// Module decorator from NestJS core
import { Module } from '@nestjs/common';

// ConfigModule for loading .env file, ConfigService for accessing env vars
import { ConfigModule, ConfigService } from '@nestjs/config';

// TypeOrmModule for database connection
import { TypeOrmModule } from '@nestjs/typeorm';

// Import feature modules
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';

// Import the root controller and service
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * @Module Decorator
 * -----------------
 * This decorator marks the class as a NestJS module.
 * Every NestJS application has at least one module - the root module.
 */
@Module({
  /**
   * IMPORTS ARRAY
   * -------------
   * List of modules that this module depends on.
   * The providers (services) exported by these modules become available here.
   */
  imports: [
    /**
     * ConfigModule.forRoot()
     * ----------------------
     * Loads environment variables from .env file.
     *
     * Options:
     * - isGlobal: true = Available in all modules without importing again
     * - envFilePath: Path to .env file (default: '.env' in root)
     *
     * After this, you can use ConfigService anywhere:
     * constructor(private configService: ConfigService) {}
     * this.configService.get('DB_HOST')
     */
    ConfigModule.forRoot({
      isGlobal: true, // Make env vars available globally
      envFilePath: '.env', // Path to environment file
    }),

    /**
     * TypeOrmModule.forRootAsync()
     * ----------------------------
     * Configures the database connection asynchronously.
     * We use 'forRootAsync' instead of 'forRoot' to access ConfigService.
     *
     * Why async?
     * - We need to wait for ConfigModule to load env vars first
     * - Then we can use them to configure the database
     *
     * The 'inject' array specifies what services to inject into 'useFactory'
     */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule to use ConfigService
      inject: [ConfigService], // Inject ConfigService into useFactory

      /**
       * useFactory
       * ----------
       * A factory function that returns the TypeORM configuration.
       * It receives the injected services as parameters.
       */
      useFactory: (configService: ConfigService) => ({
        // Database type - we're using MySQL
        type: 'mysql',

        // Database connection details from environment variables
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),

        /**
         * entities path
         * ----------------------------------------
         * Tells TypeORM where to find entity files.
         * Entities are classes that map to database tables.
         * We look in the 'dist' folder because TypeScript gets compiled there.
         */
        // Load entities from src (dev) or dist (prod)
        entities: [__dirname + '/**/*.entity{.ts,.js}'],

        /**
         * synchronize: true
         * -----------------
         * ⚠️ WARNING: Only use in development!
         *
         * When true, TypeORM automatically creates/updates database tables
         * based on your entity definitions.
         *
         * In production, use migrations instead - synchronize can cause data loss!
         */
        synchronize: configService.get('DB_SYNCHRONIZE') === 'true',

        /**
         * logging: true
         * -------------
         * When true, TypeORM logs all SQL queries to the console.
         * Helpful for debugging, but disable in production for performance.
         */
        logging: true,
      }),
    }),

    /**
     * Feature Modules
     * ---------------
     * Import all your feature modules here.
     * Each module encapsulates related functionality.
     */
    UsersModule, // User management (registration, profile, etc.)
    AuthModule, // Authentication (login, JWT tokens)
    ProductsModule, // Product CRUD operations
    CommonModule, // Shared functionality (middleware, guards, decorators)
  ],

  /**
   * CONTROLLERS ARRAY
   * -----------------
   * Controllers handle incoming HTTP requests.
   * They define routes like GET /users, POST /login, etc.
   */
  controllers: [AppController],

  /**
   * PROVIDERS ARRAY
   * ---------------
   * Providers are classes that can be injected as dependencies.
   * Usually services that contain business logic.
   */
  providers: [AppService],
})
export class AppModule {}
/**
 * EXPORT
 * ------
 * We export AppModule so it can be imported in main.ts
 * to bootstrap the application.
 */
