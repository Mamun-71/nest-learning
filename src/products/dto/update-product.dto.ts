/**
 * ============================================
 * UPDATE-PRODUCT.DTO.TS - Product Update DTO
 * ============================================
 */

import {
  IsString,
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

/**
 * UpdateProductDto
 * ----------------
 * All fields are optional for partial updates.
 */
export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Name must be less than 200 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a valid number with max 2 decimal places' })
  @IsPositive({ message: 'Price must be a positive number' })
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Stock must be a number' })
  @Min(0, { message: 'Stock cannot be negative' })
  stock?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'SKU must be less than 50 characters' })
  sku?: string;

  @IsOptional()
  @IsEnum(ProductCategory, {
    message: `Category must be one of: ${Object.values(ProductCategory).join(', ')}`,
  })
  category?: ProductCategory;

  @IsOptional()
  @IsEnum(ProductStatus, {
    message: `Status must be one of: ${Object.values(ProductStatus).join(', ')}`,
  })
  status?: ProductStatus;

  @IsOptional()
  @IsBoolean({ message: 'isFeatured must be a boolean' })
  isFeatured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Discount cannot be negative' })
  @Max(100, { message: 'Discount cannot exceed 100%' })
  discountPercent?: number;
}
