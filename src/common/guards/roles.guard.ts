/**
 * ============================================
 * ROLES.GUARD.TS - Role-Based Access Control
 * ============================================
 *
 * This guard checks if the authenticated user has the required
 * role(s) to access a route.
 *
 * GUARD INTERFACE:
 *
 * Guards must implement CanActivate interface:
 * - canActivate(context): Observable<boolean> | Promise<boolean> | boolean
 *
 * Return true to allow, false or throw exception to deny.
 *
 * REFLECTOR:
 *
 * Reflector is a NestJS utility that reads metadata from decorators.
 * We use it to get roles set by @Roles() decorator.
 *
 * EXECUTION CONTEXT:
 *
 * ExecutionContext provides access to:
 * - getHandler(): The route handler method
 * - getClass(): The controller class
 * - switchToHttp().getRequest(): Express request object
 * - getType(): 'http' | 'ws' | 'rpc'
 *
 * RBAC (Role-Based Access Control):
 *
 * Common patterns:
 * 1. User has ONE role (simple)
 * 2. User has MULTIPLE roles (more flexible)
 * 3. Hierarchical roles (ADMIN > MODERATOR > USER)
 * 4. Permission-based (fine-grained control)
 */

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  /**
   * CONSTRUCTOR
   * -----------
   * Inject Reflector to read metadata from decorators.
   */
  constructor(private reflector: Reflector) {}

  /**
   * canActivate
   * -----------
   * Core guard logic - decides if request should proceed.
   *
   * @param context - Execution context with request info
   * @returns true if authorized, false to deny
   */
  canActivate(context: ExecutionContext): boolean {
    /**
     * GET REQUIRED ROLES
     * ------------------
     * reflector.getAllAndOverride() gets metadata from:
     * 1. The route handler (@Roles() on method)
     * 2. The controller class (@Roles() on class)
     *
     * Handler-level takes priority over class-level.
     *
     * If no @Roles() decorator, requiredRoles is undefined/null.
     */
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [
        context.getHandler(), // Method-level metadata
        context.getClass(), // Class-level metadata
      ],
    );

    /**
     * NO ROLES REQUIRED
     * -----------------
     * If @Roles() wasn't used, allow access.
     * Authentication is still required (handled by JwtAuthGuard).
     */
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    /**
     * GET USER FROM REQUEST
     * ---------------------
     * JwtAuthGuard runs BEFORE RolesGuard and sets req.user.
     * If user is missing, guard fails (shouldn't happen if
     * JwtAuthGuard is used first).
     */
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    /**
     * CHECK USER ROLE
     * ---------------
     * Check if user's role is in the required roles array.
     *
     * Examples:
     * @Roles(UserRole.ADMIN) - Only admins
     * @Roles(UserRole.ADMIN, UserRole.MODERATOR) - Admins or moderators
     */
    return requiredRoles.includes(user.role);

    /**
     * ALTERNATIVE: Hierarchical Roles
     * --------------------------------
     * If you want ADMIN to access everything:
     *
     * const roleHierarchy = {
     *   [UserRole.ADMIN]: 3,
     *   [UserRole.MODERATOR]: 2,
     *   [UserRole.USER]: 1,
     * };
     *
     * const userLevel = roleHierarchy[user.role] || 0;
     * const requiredLevel = Math.min(...requiredRoles.map(r => roleHierarchy[r]));
     * return userLevel >= requiredLevel;
     */
  }
}
