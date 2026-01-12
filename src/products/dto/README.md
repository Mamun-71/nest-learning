# Product DTOs (`src/products/dto`)

This directory contains Data Transfer Objects (DTOs) for the Products feature. They define the expected data structure for API requests and handle validation.

## Key Files

### `create-product.dto.ts`
Schema for creating a new product.
- **Validation**:
    - Ensures `name` and `price` are present.
    - Validates enums for `category` and `status`.
    - Checks `price` and `stock` are positive numbers.

### `update-product.dto.ts`
Schema for updating an existing product.
- **Properties**: Inherits structure from creation but marks all fields as optional, allowing partial updates (e.g., just updating the price).

### `query-product.dto.ts`
Schema for filtering and searching products in `GET` requests.
- **Filters**: `search` (text), `category`, `status`, `minPrice`, `maxPrice`, `featured`, `inStock`.
- **Pagination**: `page` and `limit`.
- **Sorting**: `sortBy` and `sortOrder`.
