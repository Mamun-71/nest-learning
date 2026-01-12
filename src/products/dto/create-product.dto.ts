/**
 * ============================================
 * CREATE-PRODUCT.DTO.TS - Product Creation DTO
 * ============================================
 */

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  Min,
  Max,
  MaxLength,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory, ProductStatus } from '../entities/product.entity';

export class CreateProductDto {
  /**
   * Product Name
   * ------------
   * Required, string, max 200 characters.
   */
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  @MaxLength(200, { message: 'Name must be less than 200 characters' })
  name: string;

  /**
   * Product Description
   * -------------------
   * Optional text field.
   */
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Product Price
   * -------------
   * Required, must be positive number.
   *
   * @Type(() => Number) - Transforms string to number.
   * This is needed because form data or query params come as strings.
   *
   * @IsNumber() - Validates it's a number.
   * @IsPositive() - Must be greater than 0.
   */
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a valid number with max 2 decimal places' })
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;

  /**
   * Stock Quantity
   * --------------
   * Optional, defaults to 0 in entity.
   * Must be non-negative integer.
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Stock must be a number' })
  @Min(0, { message: 'Stock cannot be negative' })
  stock?: number;

  /**
   * Product SKU
   * -----------
   * Optional unique identifier.
   */
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'SKU must be less than 50 characters' })
  sku?: string;

  /**
   * Product Category
   * ----------------
   * Must be one of the enum values.
   */
  @IsOptional()
  @IsEnum(ProductCategory, {
    message: `Category must be one of: ${Object.values(ProductCategory).join(', ')}`,
  })
  category?: ProductCategory;

  /**
   * Product Status
   * --------------
   * Controls visibility and availability.
   */
  @IsOptional()
  @IsEnum(ProductStatus, {
    message: `Status must be one of: ${Object.values(ProductStatus).join(', ')}`,
  })
  status?: ProductStatus;

  /**
   * Featured Flag
   * -------------
   * Whether to highlight on homepage.
   */
  @IsOptional()
  @IsBoolean({ message: 'isFeatured must be a boolean' })
  isFeatured?: boolean;

  /**
   * Discount Percentage
   * -------------------
   * 0-100, validates as percentage.
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Discount cannot be negative' })
  @Max(100, { message: 'Discount cannot exceed 100%' })
  discountPercent?: number;
}
