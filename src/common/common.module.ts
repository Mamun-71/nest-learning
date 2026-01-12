/**
 * ============================================
 * COMMON.MODULE.TS - Shared Module
 * ============================================
 *
 * The Common module provides shared functionality
 * used across other feature modules.
 *
 * GLOBAL MODULES:
 *
 * @Global() makes the module available everywhere without importing.
 * Use sparingly - it can make dependencies hard to track.
 *
 * MIDDLEWARE CONFIGURATION:
 *
 * Middleware is configured in the module's configure() method.
 *
 * consumer.apply(Middleware).forRoutes():
 * - String: '/users' - Apply to specific path
 * - Object: { path: '/users', method: RequestMethod.GET }
 * - Controller: UsersController - Apply to controller
 * - '*' - Apply to all routes
 *
 * consumer.apply(Middleware).exclude():
 * - Exclude specific routes from middleware
 */

import { Module, NestModule, MiddlewareConsumer, Global } from '@nestjs/common';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { RolesGuard } from './guards/roles.guard';

@Global() // Makes exports available globally without importing CommonModule
@Module({
  providers: [
    RolesGuard,
    // Add other shared providers here
  ],
  exports: [
    RolesGuard,
    // Export providers for use in other modules
  ],
})
export class CommonModule implements NestModule {
  /**
   * CONFIGURE MIDDLEWARE
   * --------------------
   * Called during application initialization.
   *
   * MiddlewareConsumer allows you to:
   * - Apply middleware to routes
   * - Exclude routes from middleware
   * - Chain multiple middleware
   */
  configure(consumer: MiddlewareConsumer) {
    /**
     * APPLY LOGGING MIDDLEWARE
     * ------------------------
     * Logs all HTTP requests.
     * Applied to all routes ('*').
     */
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('*'); // Apply to ALL routes

    /**
     * APPLY RATE LIMITING
     * -------------------
     * Limit requests to prevent abuse.
     * Applied to all routes.
     *
     * You might want to exclude certain routes:
     * .exclude({ path: 'health', method: RequestMethod.GET })
     */
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes('*');

    /**
     * ALTERNATIVE: Apply to specific controllers
     * ------------------------------------------
     * consumer
     *   .apply(RateLimitMiddleware)
     *   .forRoutes(AuthController, ProductsController);
     */

    /**
     * ALTERNATIVE: Apply with path pattern
     * ------------------------------------
     * consumer
     *   .apply(LoggingMiddleware)
     *   .forRoutes({ path: 'admin/*', method: RequestMethod.ALL });
     */
  }
}
