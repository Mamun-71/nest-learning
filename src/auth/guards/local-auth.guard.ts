/**
 * ============================================
 * LOCAL-AUTH.GUARD.TS - Login Guard
 * ============================================
 *
 * Guards determine if a request should be handled by the route handler.
 * They run BEFORE the route handler and can block or allow requests.
 *
 * AuthGuard('local') integrates with Passport's LocalStrategy.
 * It automatically triggers the local authentication flow.
 *
 * GUARD EXECUTION ORDER:
 * 1. Middleware (first)
 * 2. Guards (second)
 * 3. Interceptors (before handler)
 * 4. Pipes (validation)
 * 5. Route Handler
 * 6. Interceptors (after handler)
 * 7. Exception Filters (on errors)
 *
 * WHY CREATE A WRAPPER?
 * ---------------------
 * Instead of using AuthGuard('local') directly, we create a wrapper.
 * This allows:
 * - Custom error handling
 * - Logging
 * - Additional checks
 * - Better type safety
 */

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * LocalAuthGuard
 * --------------
 * Extends AuthGuard('local') for password authentication.
 *
 * When applied to a route:
 * 1. Passport extracts email/password from request body
 * 2. LocalStrategy.validate() is called
 * 3. If valid, request proceeds with req.user set
 * 4. If invalid, UnauthorizedException is thrown
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  /**
   * canActivate
   * -----------
   * Determines if the route can be activated.
   * Calls parent's canActivate which triggers Passport.
   *
   * @param context - Execution context containing request info
   * @returns true if authentication succeeds, false otherwise
   */
  canActivate(context: ExecutionContext) {
    // Call parent AuthGuard logic
    return super.canActivate(context);
  }

  /**
   * handleRequest
   * -------------
   * Called after Passport processes the authentication.
   *
   * @param err - Error from Passport (if any)
   * @param user - User returned from LocalStrategy.validate()
   * @param info - Additional info from Passport
   * @returns The user object (becomes req.user)
   * @throws UnauthorizedException if authentication failed
   *
   * This is where you can:
   * - Customize error messages
   * - Add logging
   * - Perform additional checks
   */
  handleRequest(err: any, user: any, info: any) {
    // If there's an error or no user, authentication failed
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid credentials');
    }

    // Return user - this becomes req.user
    return user;
  }
}
