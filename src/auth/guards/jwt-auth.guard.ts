/**
 * ============================================
 * JWT-AUTH.GUARD.TS - Protected Route Guard
 * ============================================
 *
 * This guard protects routes that require authentication.
 * It validates the JWT token in the Authorization header.
 *
 * USAGE:
 *
 * 1. Single route:
 *    @UseGuards(JwtAuthGuard)
 *    @Get('profile')
 *    getProfile() { ... }
 *
 * 2. Entire controller:
 *    @UseGuards(JwtAuthGuard)
 *    @Controller('admin')
 *    export class AdminController { ... }
 *
 * 3. Global (in main.ts):
 *    app.useGlobalGuards(new JwtAuthGuard());
 *
 * COMBINING WITH OTHER GUARDS:
 *
 * Guards are executed in order. If any guard returns false
 * or throws an exception, the request is rejected.
 *
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * - First: Check if authenticated (JwtAuthGuard)
 * - Then: Check if authorized (RolesGuard)
 */

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * canActivate
   * -----------
   * Triggered when a request hits a protected route.
   *
   * Process:
   * 1. Extract token from Authorization header
   * 2. Verify token signature and expiration
   * 3. If valid, call JwtStrategy.validate()
   * 4. Attach user to request
   */
  canActivate(context: ExecutionContext) {
    // Add custom logic before authentication
    // For example, logging or pre-checks

    return super.canActivate(context);
  }

  /**
   * handleRequest
   * -------------
   * Customize the error handling after JWT validation.
   *
   * Common scenarios:
   * - No token provided
   * - Invalid token format
   * - Expired token
   * - Invalid signature
   * - User not found (from validate())
   */
  handleRequest(err: any, user: any, info: any) {
    // Log authentication attempts (optional)
    // console.log('Auth attempt:', { hasUser: !!user, error: err?.message, info });

    if (err) {
      throw err;
    }

    if (!user) {
      /**
       * INFO OBJECT
       * -----------
       * Contains details about why authentication failed.
       * Examples:
       * - info.name = 'TokenExpiredError' - Token expired
       * - info.name = 'JsonWebTokenError' - Invalid token
       * - info.message = 'No auth token' - Missing Authorization header
       */
      let message = 'Unauthorized';

      if (info) {
        if (info.name === 'TokenExpiredError') {
          message = 'Token has expired. Please log in again.';
        } else if (info.name === 'JsonWebTokenError') {
          message = 'Invalid token. Please log in again.';
        } else if (info.message) {
          message = info.message;
        }
      }

      throw new UnauthorizedException(message);
    }

    return user;
  }
}
