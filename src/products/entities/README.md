# Product Entities (`src/products/entities`)

This directory contains the database models for the Products feature, defining their structure and relationships using TypeORM.

## Key Files

### `product.entity.ts`
Defines the `Product` table schema.
- **Columns**:
    - `name`, `description`, `price` (decimal), `stock` (int).
    - `sku` (unique identifier), `category` (enum), `status` (enum: draft, active, inactive).
    - `isFeatured`, `discountPercent`.
- **Relationships**:
    - **`@ManyToOne`**: Links to the `User` entity (creator) via `createdById`.
- **Virtual Properties**:
    - `discountedPrice`: Calculates the final price on the fly.
    - `isInStock`: Boolean check for availability.
