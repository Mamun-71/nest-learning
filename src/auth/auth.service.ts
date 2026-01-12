/**
 * ============================================
 * AUTH.SERVICE.TS - Authentication Logic
 * ============================================
 *
 * Handles authentication operations:
 * - User validation (check credentials)
 * - Token generation (create JWT)
 * - Token validation (verify JWT)
 *
 * JWT TOKEN STRUCTURE:
 *
 * A JWT has three parts: Header.Payload.Signature
 *
 * 1. Header: Algorithm and token type
 *    { "alg": "HS256", "typ": "JWT" }
 *
 * 2. Payload: User data (claims)
 *    { "sub": 123, "email": "user@example.com", "iat": 1609459200 }
 *
 * 3. Signature: Verification hash
 *    HMACSHA256(base64(header) + "." + base64(payload), secret)
 *
 * CLAIMS:
 * - sub: Subject (user ID)
 * - iat: Issued at timestamp
 * - exp: Expiration timestamp
 * - Custom claims: email, role, etc.
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

/**
 * JWT Payload Interface
 * ---------------------
 * Defines the structure of data stored in the JWT token.
 * Keep the payload small - tokens are sent with every request.
 */
export interface JwtPayload {
  sub: number; // Subject (user ID) - JWT standard claim
  email: string;
  role: string;
}

/**
 * Login Response Interface
 * ------------------------
 * Structure of the login response sent to client.
 */
export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * VALIDATE USER
   * -------------
   * Validates user credentials during login.
   * Called by LocalStrategy.
   *
   * Steps:
   * 1. Find user by email
   * 2. Compare password using bcrypt
   * 3. Return user if valid, null if invalid
   *
   * @param email - User's email
   * @param password - Plain text password
   * @returns User object (without password) or null
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    // Find user by email (includes password for comparison)
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // User not found
      return null;
    }

    if (!user.isActive) {
      // User account is deactivated
      return null;
    }

    /**
     * bcrypt.compare()
     * ----------------
     * Compares plain text password with hashed password.
     * Returns true if they match, false otherwise.
     *
     * How it works:
     * 1. Extracts salt from stored hash
     * 2. Hashes the input password with that salt
     * 3. Compares the two hashes
     */
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Password doesn't match
      return null;
    }

    // Remove password before returning
    // The ... spread creates a new object without mutating original
    const { password: _, ...result } = user;
    return result as User;
  }

  /**
   * LOGIN
   * -----
   * Generates a JWT token for an authenticated user.
   * Called after validateUser() succeeds.
   *
   * @param user - Authenticated user object
   * @returns Access token and user info
   */
  async login(user: User): Promise<LoginResponse> {
    /**
     * JWT Payload
     * -----------
     * Data to include in the token.
     * Don't include sensitive data (password, etc.)
     */
    const payload: JwtPayload = {
      sub: user.id, // 'sub' is the standard JWT claim for subject
      email: user.email,
      role: user.role,
    };

    /**
     * jwtService.sign()
     * -----------------
     * Creates a signed JWT token.
     * Uses the secret and options from JwtModule configuration.
     *
     * The token can be decoded by anyone, but only verified
     * with the secret. Never put secrets in the token!
     */
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  /**
   * VALIDATE JWT PAYLOAD
   * --------------------
   * Validates the decoded JWT payload.
   * Called by JwtStrategy after token verification.
   *
   * This is where you can:
   * - Check if user still exists
   * - Check if user is still active
   * - Check if user's permissions have changed
   *
   * @param payload - Decoded JWT payload
   * @returns User object for request.user
   */
  async validateJwtPayload(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    return user;
  }

  /**
   * GET PROFILE
   * -----------
   * Returns the current user's profile.
   * Simple wrapper around usersService.findOne().
   */
  async getProfile(userId: number): Promise<User> {
    return this.usersService.findOne(userId);
  }
}
