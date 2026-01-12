/**
 * ============================================
 * JWT.STRATEGY.TS - Token Authentication
 * ============================================
 *
 * JwtStrategy validates JWT tokens on protected routes.
 *
 * HOW JWT AUTHENTICATION WORKS:
 *
 * 1. Client sends request with Authorization header:
 *    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * 2. JwtStrategy:
 *    a. Extracts token from header (handled by passport-jwt)
 *    b. Verifies signature using secret key
 *    c. Checks if token is expired
 *    d. Decodes payload if valid
 *    e. Calls validate() with decoded payload
 *
 * 3. validate() method:
 *    a. Receives decoded token payload
 *    b. Optionally verifies user still exists
 *    c. Returns user object for req.user
 *
 * TOKEN EXTRACTION:
 *
 * passport-jwt can extract tokens from:
 * - Authorization header (Bearer token) - Most common
 * - Query parameter
 * - Cookie
 * - Custom function
 */

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * CONSTRUCTOR
   * -----------
   * Note: Cannot use this.configService in super() because
   * 'this' isn't available until super() completes.
   *
   * Solution: Inject configService as parameter and use it directly.
   */
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      /**
       * jwtFromRequest
       * --------------
       * How to extract the JWT from the request.
       *
       * ExtractJwt.fromAuthHeaderAsBearerToken():
       * - Looks for "Authorization: Bearer <token>" header
       * - Extracts and returns the token part
       *
       * Other options:
       * - fromHeader('x-custom-header')
       * - fromBodyField('token')
       * - fromUrlQueryParameter('token')
       * - fromCookie('jwt')
       */
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      /**
       * ignoreExpiration
       * ----------------
       * false = Reject expired tokens (recommended)
       * true = Accept expired tokens (for special cases)
       *
       * Always use false in production!
       */
      ignoreExpiration: false,

      /**
       * secretOrKey
       * -----------
       * The secret key used to sign the JWT.
       * Must match the key used in JwtModule configuration.
       *
       * This is used to verify the token signature.
       * If someone modifies the token, signature won't match.
       */
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
    });
  }

  /**
   * VALIDATE METHOD
   * ---------------
   * Called AFTER the token has been verified.
   *
   * At this point, we know:
   * 1. Token signature is valid (not tampered)
   * 2. Token is not expired
   * 3. Token was signed with our secret
   *
   * @param payload - Decoded JWT payload
   * @returns User object (attached to req.user)
   *
   * PAYLOAD EXAMPLE:
   * {
   *   sub: 1,              // User ID
   *   email: "user@example.com",
   *   role: "user",
   *   iat: 1609459200,     // Issued at
   *   exp: 1609545600      // Expiration
   * }
   */
  async validate(payload: JwtPayload): Promise<any> {
    /**
     * OPTIONAL: Verify user still exists
     * -----------------------------------
     * The token might be valid, but the user could:
     * - Have been deleted
     * - Have been deactivated
     * - Have changed roles
     *
     * Calling validateJwtPayload checks the current state.
     * This adds a DB query per request - trade-off for security.
     */
    const user = await this.authService.validateJwtPayload(payload);

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    /**
     * RETURN USER
     * -----------
     * Whatever is returned here becomes req.user in controllers.
     *
     * You can return:
     * - Full user object (from DB lookup)
     * - Just the payload (faster, no DB query)
     * - Custom object with needed properties
     */
    return user;
  }
}
