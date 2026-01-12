/**
 * ============================================
 * APP.CONTROLLER.TS - Root Controller
 * ============================================
 *
 * Controllers are responsible for handling incoming HTTP requests
 * and returning responses to the client.
 *
 * IMPORTANT CONCEPTS:
 *
 * 1. @Controller() Decorator
 *    - Marks a class as a controller
 *    - Optional parameter defines the route prefix
 *    - @Controller('users') -> all routes start with /users
 *
 * 2. HTTP Method Decorators
 *    - @Get() - Handle GET requests (read data)
 *    - @Post() - Handle POST requests (create data)
 *    - @Put() - Handle PUT requests (update entire resource)
 *    - @Patch() - Handle PATCH requests (partial update)
 *    - @Delete() - Handle DELETE requests (remove data)
 *
 * 3. Route Parameters
 *    - @Get(':id') - Captures URL parameters
 *    - @Param('id') - Extracts the parameter value
 *
 * 4. Request/Response Objects
 *    - @Body() - Extract request body
 *    - @Query() - Extract query parameters (?name=value)
 *    - @Headers() - Extract request headers
 */

// Import decorators from NestJS common package
import { Controller, Get } from '@nestjs/common';

// Import the service that contains business logic
import { AppService } from './app.service';

/**
 * @Controller() Decorator
 * -----------------------
 * Empty string means this controller handles routes at the root path '/'
 *
 * Examples:
 * - @Controller() or @Controller('') -> GET http://localhost:3000/
 * - @Controller('api') -> GET http://localhost:3000/api/
 * - @Controller('api/v1/users') -> GET http://localhost:3000/api/v1/users/
 */
@Controller()
export class AppController {
  /**
   * CONSTRUCTOR - Dependency Injection
   * ----------------------------------
   * NestJS uses constructor-based dependency injection.
   *
   * The 'private readonly' syntax is TypeScript shorthand that:
   * 1. Declares a class property
   * 2. Makes it private (only accessible within this class)
   * 3. Makes it readonly (can't be reassigned)
   * 4. Assigns the injected value to it
   *
   * Equivalent to:
   * private readonly appService: AppService;
   * constructor(appService: AppService) {
   *   this.appService = appService;
   * }
   */
  constructor(private readonly appService: AppService) {}

  /**
   * GET /
   * -----
   * @Get() decorator handles HTTP GET requests to '/'
   *
   * Route: GET http://localhost:3000/
   * Response: "Hello World!" (or whatever appService.getHello() returns)
   */
  @Get()
  getHello(): string {
    // Delegate to the service for business logic
    return this.appService.getHello();
  }

  /**
   * GET /health
   * -----------
   * Health check endpoint - useful for monitoring and load balancers.
   * Returns a simple status message.
   *
   * Route: GET http://localhost:3000/health
   */
  @Get('health')
  getHealth(): { status: string; timestamp: Date } {
    return {
      status: 'OK',
      timestamp: new Date(),
    };
  }
}
