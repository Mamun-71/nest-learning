/**
 * ============================================
 * UPDATE-USER.DTO.TS - Partial Update DTO
 * ============================================
 *
 * For update operations, we usually want to allow partial updates.
 * This means the client can send only the fields they want to update.
 *
 * NESTJS MAPPED TYPES:
 *
 * NestJS provides utility types to create DTOs from existing ones:
 *
 * 1. PartialType - Makes all fields optional
 *    class UpdateUserDto extends PartialType(CreateUserDto) {}
 *
 * 2. PickType - Pick specific fields from a DTO
 *    class EmailDto extends PickType(CreateUserDto, ['email']) {}
 *
 * 3. OmitType - Exclude specific fields
 *    class UpdateUserDto extends OmitType(CreateUserDto, ['password']) {}
 *
 * 4. IntersectionType - Combine two DTOs
 *    class CombinedDto extends IntersectionType(DtoA, DtoB) {}
 *
 * WHY USE PartialType?
 * - DRY (Don't Repeat Yourself) - Reuse validation rules
 * - Maintenance - Change in CreateDto automatically affects UpdateDto
 * - Consistency - Same validation rules for create and update
 */

import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

/**
 * UpdateUserDto
 * -------------
 * All fields are optional for partial updates.
 * Password is excluded (handled by separate endpoint).
 */
export class UpdateUserDto {
  /**
   * Email Field (Optional for updates)
   */
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must be less than 255 characters' })
  email?: string;

  /**
   * First Name Field (Optional for updates)
   */
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'First name must be less than 100 characters' })
  firstName?: string;

  /**
   * Last Name Field (Optional for updates)
   */
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Last name must be less than 100 characters' })
  lastName?: string;

  /**
   * Phone Field (Optional)
   */
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Phone number must be less than 20 characters' })
  phone?: string;

  /**
   * Role Field (Optional for updates)
   */
  @IsOptional()
  @IsEnum(UserRole, {
    message: `Role must be one of: ${Object.values(UserRole).join(', ')}`,
  })
  role?: UserRole;

  /**
   * IsActive Field
   * --------------
   * Allows updating the user's active status.
   */
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
