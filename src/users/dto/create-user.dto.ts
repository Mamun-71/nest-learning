/**
 * ============================================
 * CREATE-USER.DTO.TS - Data Transfer Object
 * ============================================
 *
 * DTOs (Data Transfer Objects) define the shape of data
 * that is transferred between layers of the application.
 *
 * PURPOSE OF DTOs:
 * 1. Validation - Validate incoming request data
 * 2. Documentation - Define what data is expected
 * 3. Type Safety - TypeScript knows the exact shape
 * 4. Security - Prevent unwanted fields from being set
 *
 * CLASS-VALIDATOR DECORATORS:
 * These decorators validate the data automatically when
 * used with NestJS's ValidationPipe.
 *
 * - @IsEmail() - Must be a valid email format
 * - @IsString() - Must be a string
 * - @IsNotEmpty() - Cannot be empty/null/undefined
 * - @MinLength(n) - Minimum n characters
 * - @MaxLength(n) - Maximum n characters
 * - @IsOptional() - Field is optional
 * - @IsEnum() - Must be one of enum values
 * - @Matches() - Must match regex pattern
 * - @IsPhoneNumber() - Must be valid phone number
 */

import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';

import { UserRole } from '../entities/user.entity';

/**
 * CreateUserDto
 * -------------
 * Defines the data required to create a new user.
 * All required fields will be validated before reaching the controller.
 */
export class CreateUserDto {
  /**
   * Email Field
   * -----------
   * @IsEmail() validates that the value is a valid email format.
   * @IsNotEmpty() ensures the field is not empty.
   * @MaxLength() prevents extremely long emails.
   */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(255, { message: 'Email must be less than 255 characters' })
  email: string;

  /**
   * Password Field
   * --------------
   * @MinLength(8) ensures password is at least 8 characters.
   * @Matches() uses regex to enforce password complexity:
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   */
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password must be less than 100 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  /**
   * First Name Field
   * ----------------
   * @IsString() ensures it's a string type.
   * @IsNotEmpty() makes it required.
   * @MaxLength(100) limits the length.
   */
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(100, { message: 'First name must be less than 100 characters' })
  firstName: string;

  /**
   * Last Name Field
   * ---------------
   * Same validation as firstName.
   */
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(100, { message: 'Last name must be less than 100 characters' })
  lastName: string;

  /**
   * Phone Field (Optional)
   * ----------------------
   * @IsOptional() means this field can be omitted.
   * If provided, it will still be validated by other decorators.
   */
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Phone number must be less than 20 characters' })
  phone?: string;

  /**
   * Role Field (Optional)
   * ---------------------
   * @IsOptional() allows omitting the field.
   * @IsEnum() ensures the value is one of the UserRole enum values.
   * If not provided, defaults to 'user' (set in the entity).
   */
  @IsOptional()
  @IsEnum(UserRole, {
    message: `Role must be one of: ${Object.values(UserRole).join(', ')}`,
  })
  role?: UserRole;
}
