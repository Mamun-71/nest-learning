/**
 * ============================================
 * PUBLIC.DECORATOR.TS - Mark Routes as Public
 * ============================================
 *
 * When using JwtAuthGuard globally, all routes require authentication.
 * This decorator marks specific routes as public (no auth required).
 *
 * Used with a modified JwtAuthGuard that checks for this metadata.
 */

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() Decorator
 * -------------------
 * Mark a route as publicly accessible.
 *
 * Usage:
 *   @Public()
 *   @Get('public-route')
 *   publicData() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
