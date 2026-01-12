/**
 * ============================================
 * ROLES.DECORATOR.TS - Custom Roles Decorator
 * ============================================
 *
 * Custom decorators allow you to add metadata to classes and methods.
 * This metadata can be read by guards and interceptors.
 *
 * CUSTOM DECORATOR PATTERN:
 *
 * 1. Define a unique key (symbol or string)
 * 2. Create a function that uses SetMetadata()
 * 3. Use the decorator on routes/controllers
 * 4. Read the metadata in guards using Reflector
 *
 * SetMetadata(key, value):
 * - Attaches metadata to the decorated target
 * - Can be class-level or method-level
 * - Read using Reflector in guards/interceptors
 */

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

/**
 * ROLES_KEY
 * ---------
 * Unique key to store and retrieve roles metadata.
 * Using a constant ensures consistency between decorator and guard.
 */
export const ROLES_KEY = 'roles';

/**
 * @Roles() Decorator
 * ------------------
 * Apply to routes or controllers to restrict access by role.
 *
 * Usage:
 *   @Roles(UserRole.ADMIN)
 *   @Get('admin-only')
 *   adminRoute() { ... }
 *
 *   @Roles(UserRole.ADMIN, UserRole.MODERATOR)
 *   @Get('staff-only')
 *   staffRoute() { ... }
 *
 * @param roles - One or more UserRole values
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
