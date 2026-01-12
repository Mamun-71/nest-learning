/**
 * ============================================
 * QUERY-PRODUCT.DTO.TS - Product Search/Filter DTO
 * ============================================
 *
 * Used for GET requests with query parameters.
 * Enables filtering, searching, sorting, and pagination.
 *
 * Example: GET /products?category=electronics&minPrice=100&page=1&limit=10
 */

import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory, ProductStatus } from '../entities/product.entity';

export class QueryProductDto {
  /**
   * Search Query
   * ------------
   * Search in name and description.
   */
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Category Filter
   * ---------------
   * Filter by product category.
   */
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  /**
   * Status Filter
   * -------------
   * Filter by product status.
   */
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  /**
   * Price Range - Minimum
   * ---------------------
   * Filter products with price >= minPrice.
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  /**
   * Price Range - Maximum
   * ---------------------
   * Filter products with price <= maxPrice.
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  /**
   * Featured Filter
   * ---------------
   * Filter for featured products only.
   * Query param: ?featured=true
   */
  @IsOptional()
  @Type(() => Boolean)
  featured?: boolean;

  /**
   * In Stock Filter
   * ---------------
   * Filter for in-stock products only.
   */
  @IsOptional()
  @Type(() => Boolean)
  inStock?: boolean;

  /**
   * Pagination - Page Number
   * ------------------------
   * Current page (1-indexed).
   * Default: 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  /**
   * Pagination - Items Per Page
   * ---------------------------
   * Number of items per page.
   * Default: 10, Max: 100
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  /**
   * Sort By Field
   * -------------
   * Field to sort by.
   * Default: 'createdAt'
   */
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  /**
   * Sort Order
   * ----------
   * ASC (ascending) or DESC (descending).
   * Default: 'DESC'
   */
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
