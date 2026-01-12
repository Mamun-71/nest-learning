/**
 * ============================================
 * CURRENT-USER.DECORATOR.TS - Get Current User
 * ============================================
 *
 * Custom parameter decorator to extract the current user
 * from the request object.
 *
 * PARAMETER DECORATORS:
 *
 * NestJS has built-in parameter decorators:
 * - @Body() - Request body
 * - @Query() - Query parameters
 * - @Param() - Route parameters
 * - @Headers() - Request headers
 * - @Request() - Entire request object
 *
 * Custom parameter decorators extract specific data.
 *
 * createParamDecorator(data, ctx):
 * - data: Any argument passed to the decorator
 * - ctx: ExecutionContext
 * - Returns: The value to inject into the parameter
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

/**
 * @CurrentUser() Decorator
 * ------------------------
 * Parameter decorator that extracts the authenticated user.
 *
 * Usage:
 *   @Get('profile')
 *   getProfile(@CurrentUser() user: User) {
 *     return user;
 *   }
 *
 *   // Get specific property
 *   @Get('my-email')
 *   getEmail(@CurrentUser('email') email: string) {
 *     return { email };
 *   }
 */
export const CurrentUser = createParamDecorator(
  /**
   * data: The argument passed to the decorator
   *   - @CurrentUser() -> data = undefined
   *   - @CurrentUser('email') -> data = 'email'
   *
   * ctx: ExecutionContext for accessing request
   */
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    // Get the HTTP request from context
    const request = ctx.switchToHttp().getRequest();

    // Get user from request (set by JwtAuthGuard)
    const user = request.user;

    // If no user, return undefined (route might be public or auth failed)
    if (!user) {
      return undefined;
    }

    // If specific property requested, return just that property
    if (data) {
      return user[data];
    }

    // Return entire user object
    return user;
  },
);
