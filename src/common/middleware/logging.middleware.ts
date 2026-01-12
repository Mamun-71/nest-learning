/**
 * ============================================
 * LOGGING.MIDDLEWARE.TS - Request Logger
 * ============================================
 *
 * Middleware runs BEFORE the route handler.
 * It can:
 * - Execute code before the handler
 * - Modify the request/response objects
 * - End the request-response cycle
 * - Call next() to pass to next middleware
 *
 * MIDDLEWARE vs GUARDS vs INTERCEPTORS:
 *
 * MIDDLEWARE (first):
 * - Runs before guards
 * - Similar to Express middleware
 * - Has access to request and response
 * - Can modify request before it reaches guards
 *
 * GUARDS (second):
 * - Run after middleware
 * - Determine if request should proceed
 * - Have access to ExecutionContext
 * - Used for authentication/authorization
 *
 * INTERCEPTORS (third, wraps handler):
 * - Run before AND after handler
 * - Can transform the response
 * - Can implement caching, logging, etc.
 * - Have access to both request and response
 *
 * PIPES (fourth, parameter level):
 * - Transform input data
 * - Validate input data
 * - Run just before handler
 *
 * TYPES OF MIDDLEWARE:
 *
 * 1. Function Middleware (simple):
 *    export function logger(req, res, next) { ... }
 *
 * 2. Class Middleware (with DI):
 *    @Injectable()
 *    export class LoggerMiddleware implements NestMiddleware { ... }
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  /**
   * LOGGER
   * ------
   * NestJS built-in logger.
   * Creates a logger with 'HTTP' context.
   */
  private readonly logger = new Logger('HTTP');

  /**
   * use Method
   * ----------
   * Core middleware logic.
   *
   * @param req - Express Request object
   * @param res - Express Response object
   * @param next - Function to call next middleware
   */
  use(req: Request, res: Response, next: NextFunction) {
    // Capture request start time
    const startTime = Date.now();

    // Extract request info
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';

    /**
     * RESPONSE FINISH EVENT
     * ---------------------
     * 'finish' event fires when response is sent.
     * We use it to log after the response is complete.
     */
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const contentLength = res.get('content-length') || 0;

      // Format log message
      const message = `${method} ${originalUrl} ${statusCode} ${duration}ms ${contentLength}bytes`;

      // Log with appropriate level based on status code
      if (statusCode >= 500) {
        this.logger.error(message);
      } else if (statusCode >= 400) {
        this.logger.warn(message);
      } else {
        this.logger.log(message);
      }

      // Optional: Log detailed info for debugging
      // this.logger.debug(`IP: ${ip}, User-Agent: ${userAgent}`);
    });

    // IMPORTANT: Must call next() to continue to next middleware/handler
    next();
  }
}

/**
 * FUNCTION MIDDLEWARE EXAMPLE
 * ---------------------------
 * Simpler alternative for cases that don't need DI.
 */
export function simpleLogger(req: Request, res: Response, next: NextFunction) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}
