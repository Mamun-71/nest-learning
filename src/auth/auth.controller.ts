/**
 * ============================================
 * AUTH.CONTROLLER.TS - Authentication Endpoints
 * ============================================
 *
 * Handles authentication HTTP requests:
 * - POST /auth/login - User login
 * - GET /auth/profile - Get current user
 * - POST /auth/register - User registration
 *
 * AUTHENTICATION DECORATORS:
 *
 * @UseGuards(AuthGuard('local'))
 * - Uses LocalStrategy to validate credentials
 * - Receives username/password, returns user or 401
 *
 * @UseGuards(AuthGuard('jwt'))
 * - Uses JwtStrategy to validate token
 * - Checks Authorization header, validates JWT
 *
 * @Request() decorator
 * - Injects the Express Request object
 * - After auth, req.user contains the authenticated user
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * POST /auth/register - User Registration
   * ---------------------------------------
   * Public endpoint for new user registration.
   *
   * Uses the same CreateUserDto as the users endpoint
   * for consistent validation.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    // Automatically log in after registration
    return this.authService.login(user);
  }

  /**
   * POST /auth/login - User Login
   * -----------------------------
   * Authenticates user and returns JWT token.
   *
   * @UseGuards(LocalAuthGuard)
   * - Triggers Passport's LocalStrategy
   * - LocalStrategy calls authService.validateUser()
   * - If valid, user is attached to request
   * - If invalid, 401 Unauthorized is thrown
   *
   * Flow:
   * 1. Client sends: { "email": "...", "password": "..." }
   * 2. LocalAuthGuard triggers LocalStrategy
   * 3. LocalStrategy validates credentials
   * 4. Valid: req.user = user, proceed to handler
   * 5. Invalid: throw UnauthorizedException (401)
   */
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Body() loginDto: LoginDto) {
    /**
     * req.user
     * --------
     * Populated by Passport after successful authentication.
     * Contains the user object returned by validateUser().
     */
    return this.authService.login(req.user);
  }

  /**
   * GET /auth/profile - Get Current User
   * ------------------------------------
   * Returns the authenticated user's profile.
   *
   * @UseGuards(JwtAuthGuard)
   * - Validates JWT token from Authorization header
   * - Header format: "Authorization: Bearer <token>"
   * - Attaches user to request after validation
   *
   * Flow:
   * 1. Client sends request with Bearer token
   * 2. JwtAuthGuard triggers JwtStrategy
   * 3. JwtStrategy:
   *    a. Extracts token from header
   *    b. Verifies signature with secret
   *    c. Checks expiration
   *    d. Calls authService.validateJwtPayload()
   * 4. Valid: req.user = user, proceed
   * 5. Invalid: throw UnauthorizedException (401)
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  /**
   * POST /auth/logout - Logout (Stateless)
   * --------------------------------------
   * For JWT authentication, logout is typically handled client-side.
   * The client simply discards the token.
   *
   * This endpoint is for:
   * - Token blacklisting (advanced)
   * - Audit logging
   * - Clearing server-side sessions (if any)
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(@Request() req) {
    // In a real app, you might:
    // - Add token to blacklist
    // - Log the logout event
    // - Clear any server-side session data

    return {
      message: 'Logged out successfully',
      user: req.user.email,
    };
  }
}
