# Products Feature (`src/products`)

This module manages the product catalog, including CRUD operations, stock management, and product filtering.

## Key Files

### `products.module.ts`
The specific feature module for products.
- **Imports**: `TypeOrmModule.forFeature([Product])` to register the Product entity.
- **Exports**: `ProductsService` to allow other modules (e.g., Orders) to access product logic.

### `products.controller.ts`
Handles HTTP requests for products.
- **Public Routes**: Listing (`GET /`), fetching one (`GET /:id`), finding by category, and featured products.
- **Protected Routes**: Creating (`POST /`), updating (`PATCH /:id`), and modifying stock/discounts (require JWT).
- **Admin Routes**: Statistics (`GET /admin/stats`), low stock alerts, and bulk updates (require ADMIN role).

### `products.service.ts`
Contains complex business logic for products.
- **Advanced Querying**: Uses `QueryBuilder` in `findAll()` to implement dynamic filters (search, category, price range, stock status) and pagination.
- **Stock Management**: `updateStock()` handles inventory changes and validation.
- **Statistics**: `getStatistics()` aggregates data for admin dashboards (counts, averages, groupings).

## Directory Structure
- **`dto/`**: Data Transfer Objects for product creation (`CreateProductDto`), updates (`UpdateProductDto`), and querying (`QueryProductDto`).
- **`entities/`**: The TypeORM `Product` entity definition mapping to the database table.
