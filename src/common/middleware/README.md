# Common Middleware (`src/common/middleware`)

This directory contains middleware that inspects or modifies requests before they reach the route handlers.

## Key Files

### `logging.middleware.ts`
Standard HTTP request logger.
- **Functionality**: Logs the method, URL, status code, duration, and content length for every request.
- **Logic**: Uses the `res.on('finish')` event listener to log details *after* the response has been sent to the client.

### `rate-limit.middleware.ts`
Basic in-memory rate limiting protection.
- **Functionality**: Limits the number of requests a client (identified by IP) can make within a specific time window.
- **Settings**: Currently configured for 100 requests per minute.
- **Response**: Adds headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`) and returns 429 Too Many Requests if the limit is exceeded.
