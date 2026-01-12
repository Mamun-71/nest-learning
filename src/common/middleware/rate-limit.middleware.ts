/**
 * ============================================
 * RATE-LIMIT.MIDDLEWARE.TS - Request Throttling
 * ============================================
 *
 * Rate limiting protects your API from abuse by limiting
 * the number of requests a client can make in a time window.
 *
 * WHY RATE LIMITING?
 *
 * 1. Prevent DDoS attacks
 * 2. Protect against brute force (login attempts)
 * 3. Ensure fair usage
 * 4. Reduce server load
 *
 * IMPLEMENTATION STRATEGIES:
 *
 * 1. In-Memory (this example):
 *    - Simple, no external dependencies
 *    - Doesn't work in clustered environments
 *    - Memory grows with unique IPs
 *
 * 2. Redis (production):
 *    - Scales across multiple servers
 *    - Persistent across restarts
 *    - Use @nestjs/throttler package
 *
 * COMMON ALGORITHMS:
 *
 * 1. Fixed Window:
 *    - Count resets every N minutes
 *    - Simple but can allow bursts at window edges
 *
 * 2. Sliding Window (this example):
 *    - Counts requests in past N minutes
 *    - Smoother rate limiting
 *
 * 3. Token Bucket:
 *    - Tokens accumulate over time
 *    - Allows controlled bursts
 */

import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Rate Limit Configuration
 */
interface RateLimitRecord {
  count: number;
  firstRequest: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  /**
   * IN-MEMORY STORE
   * ---------------
   * Stores request counts per IP.
   * Use Redis in production for persistence and scaling.
   */
  private readonly requests = new Map<string, RateLimitRecord>();

  /**
   * CONFIGURATION
   * -------------
   * - windowMs: Time window in milliseconds (1 minute)
   * - maxRequests: Maximum requests per window
   */
  private readonly windowMs = 60 * 1000; // 1 minute
  private readonly maxRequests = 100; // 100 requests per minute

  use(req: Request, res: Response, next: NextFunction) {
    // Get client identifier (IP address)
    const clientId = this.getClientId(req);
    const now = Date.now();

    // Get or create record for this client
    let record = this.requests.get(clientId);

    if (!record) {
      // First request from this client
      record = { count: 1, firstRequest: now };
      this.requests.set(clientId, record);
    } else {
      // Check if window has expired
      if (now - record.firstRequest > this.windowMs) {
        // Reset the window
        record.count = 1;
        record.firstRequest = now;
      } else {
        // Increment count
        record.count++;
      }
    }

    // Calculate remaining requests and reset time
    const remaining = Math.max(0, this.maxRequests - record.count);
    const resetTime = new Date(record.firstRequest + this.windowMs);

    /**
     * RATE LIMIT HEADERS
     * ------------------
     * Standard headers to inform clients about limits.
     */
    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTime.toISOString());

    // Check if limit exceeded
    if (record.count > this.maxRequests) {
      // Calculate retry time
      const retryAfter = Math.ceil(
        (record.firstRequest + this.windowMs - now) / 1000,
      );
      res.setHeader('Retry-After', retryAfter);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    next();
  }

  /**
   * GET CLIENT ID
   * -------------
   * Extract unique identifier for the client.
   *
   * Options:
   * - IP address (may be shared in NAT)
   * - API key (for authenticated clients)
   * - User ID (after authentication)
   */
  private getClientId(req: Request): string {
    // Check for forwarded IP (behind proxy)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    }

    // Fall back to direct IP
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  /**
   * CLEANUP
   * -------
   * Periodically remove expired records to prevent memory leak.
   * Call this method on an interval in production.
   */
  cleanup() {
    const now = Date.now();
    for (const [clientId, record] of this.requests.entries()) {
      if (now - record.firstRequest > this.windowMs * 2) {
        this.requests.delete(clientId);
      }
    }
  }
}
