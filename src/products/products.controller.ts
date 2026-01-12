/**
 * ============================================
 * PRODUCTS.CONTROLLER.TS - Product HTTP Endpoints
 * ============================================
 *
 * ROUTE STRUCTURE:
 *
 * Public Routes:
 * - GET /products - List products (with filters)
 * - GET /products/featured - Get featured products
 * - GET /products/category/:category - Get by category
 * - GET /products/:id - Get single product
 *
 * Protected Routes (require authentication):
 * - POST /products - Create product
 * - PATCH /products/:id - Update product
 * - DELETE /products/:id - Delete product
 * - PATCH /products/:id/stock - Update stock
 * - PATCH /products/:id/discount - Apply discount
 *
 * Admin Only Routes:
 * - GET /products/stats - Get statistics
 * - GET /products/low-stock - Get low stock items
 * - POST /products/bulk-status - Bulk update status
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';

import { ProductsService, PaginatedResponse } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Product, ProductCategory, ProductStatus } from './entities/product.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Public } from '../common/decorators/public.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================

  /**
   * GET /products - List All Products
   * ---------------------------------
   * Public endpoint with filtering and pagination.
   *
   * @Query() extracts query parameters from URL.
   * Example: /products?category=electronics&minPrice=100&page=1
   */
  @Get()
  @Public() // Custom decorator to mark as public
  findAll(@Query() query: QueryProductDto): Promise<PaginatedResponse<Product>> {
    return this.productsService.findAll(query);
  }

  /**
   * GET /products/featured - Featured Products
   * ------------------------------------------
   * Get products marked as featured.
   */
  @Get('featured')
  @Public()
  getFeatured(@Query('limit') limit?: number): Promise<Product[]> {
    return this.productsService.getFeaturedProducts(limit || 10);
  }

  /**
   * GET /products/category/:category - Products by Category
   * -------------------------------------------------------
   * Get all products in a specific category.
   */
  @Get('category/:category')
  @Public()
  getByCategory(@Param('category') category: ProductCategory): Promise<Product[]> {
    return this.productsService.getByCategory(category);
  }

  /**
   * GET /products/:id - Get Single Product
   * --------------------------------------
   * Get detailed info for one product.
   */
  @Get(':id')
  @Public()
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  // ==========================================
  // PROTECTED ENDPOINTS (Authenticated Users)
  // ==========================================

  /**
   * POST /products - Create Product
   * -------------------------------
   * Create a new product.
   *
   * @Request() gives access to the Express request object.
   * After authentication, req.user contains the logged-in user.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createProductDto: CreateProductDto,
    @Request() req,
  ): Promise<Product> {
    return this.productsService.create(createProductDto, req.user);
  }

  /**
   * PATCH /products/:id - Update Product
   * ------------------------------------
   * Update product fields.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * DELETE /products/:id - Delete Product
   * -------------------------------------
   * Permanently delete a product.
   * Only admins can delete.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productsService.remove(id);
  }

  /**
   * PATCH /products/:id/stock - Update Stock
   * ----------------------------------------
   * Update product stock quantity.
   *
   * Body: { quantity: number }
   * - Positive: Add stock (receiving inventory)
   * - Negative: Subtract stock (order placed)
   */
  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard)
  async updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ): Promise<Product> {
    return this.productsService.updateStock(id, quantity);
  }

  /**
   * PATCH /products/:id/discount - Apply Discount
   * ---------------------------------------------
   * Apply a discount percentage to a product.
   *
   * Body: { discountPercent: number }
   */
  @Patch(':id/discount')
  @UseGuards(JwtAuthGuard)
  async applyDiscount(
    @Param('id', ParseIntPipe) id: number,
    @Body('discountPercent') discountPercent: number,
  ): Promise<Product> {
    return this.productsService.applyDiscount(id, discountPercent);
  }

  // ==========================================
  // ADMIN ONLY ENDPOINTS
  // ==========================================

  /**
   * GET /products/admin/stats - Product Statistics
   * -----------------------------------------------
   * Dashboard statistics for admin.
   */
  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getStatistics() {
    return this.productsService.getStatistics();
  }

  /**
   * GET /products/admin/low-stock - Low Stock Alert
   * ------------------------------------------------
   * Get products with low stock.
   */
  @Get('admin/low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getLowStock(@Query('threshold') threshold?: number): Promise<Product[]> {
    return this.productsService.getLowStockProducts(threshold || 10);
  }

  /**
   * POST /products/admin/bulk-status - Bulk Status Update
   * ------------------------------------------------------
   * Update status for multiple products.
   *
   * Body: { ids: number[], status: ProductStatus }
   */
  @Post('admin/bulk-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async bulkUpdateStatus(
    @Body('ids') ids: number[],
    @Body('status') status: ProductStatus,
  ): Promise<{ message: string }> {
    await this.productsService.bulkUpdateStatus(ids, status);
    return { message: `Updated ${ids.length} products to status: ${status}` };
  }
}
