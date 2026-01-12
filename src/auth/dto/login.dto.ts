/**
 * ============================================
 * LOGIN.DTO.TS - Login Request Validation
 * ============================================
 *
 * DTO for the login endpoint.
 * Validates email and password before authentication.
 */

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  /**
   * Email Field
   * -----------
   * Must be a valid email format.
   */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  /**
   * Password Field
   * --------------
   * Must be a non-empty string.
   * We don't enforce complexity here since we're just checking
   * against stored password, not creating a new one.
   */
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(1, { message: 'Password is required' })
  password: string;
}
