/**
 * ============================================
 * LOCAL.STRATEGY.TS - Password Authentication
 * ============================================
 *
 * LocalStrategy handles username/password authentication.
 * It's used for the login endpoint.
 *
 * PASSPORT STRATEGY PATTERN:
 *
 * Every Passport strategy follows the same pattern:
 * 1. Extend the base strategy class
 * 2. Call super() with configuration options
 * 3. Implement validate() method
 *
 * The validate() method:
 * - Receives credentials from the request
 * - Returns user object if valid
 * - Throws exception if invalid
 * - Returned user is attached to req.user
 *
 * HOW IT WORKS:
 *
 * 1. Request comes to /auth/login with { email, password }
 * 2. LocalAuthGuard triggers this strategy
 * 3. Passport extracts email and password from body
 * 4. validate() is called with these values
 * 5. We verify against database
 * 6. Return user or throw exception
 */

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';

/**
 * LocalStrategy
 * -------------
 * Extends PassportStrategy with the 'local' strategy.
 *
 * @Injectable() - Required for NestJS dependency injection
 * PassportStrategy(Strategy) - Strategy is the local strategy from passport-local
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    /**
     * super() Configuration
     * ---------------------
     * Customize how Passport extracts credentials.
     *
     * By default, local strategy looks for:
     * - username (field in request body)
     * - password (field in request body)
     *
     * We customize to use 'email' instead of 'username'.
     */
    super({
      usernameField: 'email', // Use 'email' field instead of 'username'
      passwordField: 'password', // Default, but explicit for clarity
    });
  }

  /**
   * VALIDATE METHOD
   * ---------------
   * Core authentication logic.
   *
   * @param email - From usernameField (request body)
   * @param password - From passwordField (request body)
   * @returns User object (attached to req.user)
   * @throws UnauthorizedException if invalid
   *
   * IMPORTANT:
   * - This method name must be 'validate' - Passport requirement
   * - Whatever is returned becomes req.user
   * - Throwing any exception rejects authentication
   */
  async validate(email: string, password: string): Promise<any> {
    // Delegate to AuthService for credential validation
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      /**
       * UnauthorizedException
       * ---------------------
       * Throws HTTP 401 Unauthorized.
       * Client receives: { "statusCode": 401, "message": "...", "error": "Unauthorized" }
       */
      throw new UnauthorizedException('Invalid email or password');
    }

    // Return user - this becomes req.user in the controller
    return user;
  }
}
