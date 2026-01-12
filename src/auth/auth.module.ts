/**
 * ============================================
 * AUTH.MODULE.TS - Authentication Module
 * ============================================
 *
 * This module handles authentication using JWT (JSON Web Tokens).
 *
 * AUTHENTICATION FLOW:
 *
 * 1. User sends credentials (email/password) to POST /auth/login
 * 2. LocalStrategy validates credentials against database
 * 3. If valid, AuthService creates a JWT token
 * 4. Token is returned to the client
 * 5. Client includes token in future requests (Authorization header)
 * 6. JwtStrategy validates the token on protected routes
 *
 * PASSPORT INTEGRATION:
 *
 * Passport.js is the most popular authentication library for Node.js.
 * NestJS provides @nestjs/passport for seamless integration.
 *
 * Strategies:
 * - LocalStrategy: Username/password authentication
 * - JwtStrategy: JWT token validation
 * - Many others: OAuth, Google, Facebook, etc.
 *
 * JWT MODULE CONFIGURATION:
 *
 * JwtModule.registerAsync() configures:
 * - secret: The key used to sign tokens
 * - signOptions.expiresIn: Token expiration time
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    /**
     * UsersModule
     * -----------
     * Import to access UsersService for user lookup.
     * UsersModule must export UsersService.
     */
    UsersModule,

    /**
     * PassportModule
     * --------------
     * Enables Passport.js integration.
     * defaultStrategy: 'jwt' means JWT is used by default.
     */
    PassportModule.register({ defaultStrategy: 'jwt' }),

    /**
     * JwtModule.registerAsync()
     * -------------------------
     * Async registration to use ConfigService for env vars.
     *
     * Configuration:
     * - secret: Key to sign/verify tokens (keep it secret!)
     * - expiresIn: Token validity period ('1d', '7d', '1h', etc.)
     */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') || '1d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy, // For login form authentication
    JwtStrategy, // For JWT token validation
  ],
  exports: [AuthService], // Export for use in other modules
})
export class AuthModule {}
