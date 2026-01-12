/**
 * ============================================
 * APP.SERVICE.TS - Root Service
 * ============================================
 *
 * Services (also called Providers) contain the business logic
 * of your application. They handle data processing, database
 * operations, and other complex tasks.
 *
 * IMPORTANT CONCEPTS:
 *
 * 1. @Injectable() Decorator
 *    - Marks a class as a provider that can be injected
 *    - Required for dependency injection to work
 *    - Classes with @Injectable() are managed by NestJS's IoC container
 *
 * 2. Separation of Concerns
 *    - Controllers handle HTTP layer (routes, request/response)
 *    - Services handle business logic (calculations, data processing)
 *    - This makes code more testable and maintainable
 *
 * 3. Single Responsibility
 *    - Each service should focus on one area of functionality
 *    - UserService handles user operations
 *    - AuthService handles authentication
 *    - ProductService handles product operations
 */

// Import Injectable decorator
import { Injectable } from '@nestjs/common';

/**
 * @Injectable() Decorator
 * -----------------------
 * This decorator tells NestJS that this class can be:
 * 1. Injected into other classes (as a dependency)
 * 2. Have dependencies injected into it
 *
 * Without @Injectable(), NestJS cannot manage this class
 * and dependency injection will fail.
 */
@Injectable()
export class AppService {
  /**
   * getHello Method
   * ---------------
   * A simple method that returns a greeting string.
   *
   * This demonstrates:
   * - Business logic lives in services, not controllers
   * - Controllers call service methods to get data
   * - Easy to test because logic is isolated
   */
  getHello(): string {
    return 'Welcome to NestJS Learning Project! 🚀';
  }
}
