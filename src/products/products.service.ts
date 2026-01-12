/**
 * ============================================
 * PRODUCTS.SERVICE.TS - Product Business Logic
 * ============================================
 *
 * Handles all product-related operations including:
 * - CRUD operations
 * - Business logic (discounts, stock management)
 * - Advanced queries (filtering, pagination)
 *
 * TYPEORM QUERY BUILDER:
 *
 * For complex queries, TypeORM provides QueryBuilder.
 * It's more flexible than repository methods:
 *
 * this.productRepository
 *   .createQueryBuilder('product')
 *   .where('product.status = :status', { status: 'active' })
 *   .andWhere('product.price > :price', { price: 100 })
 *   .orderBy('product.createdAt', 'DESC')
 *   .getMany();
 */

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

import { Product, ProductStatus, ProductCategory } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { User } from '../users/entities/user.entity';

/**
 * Paginated Response Interface
 * ----------------------------
 * Standard structure for paginated results.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * CREATE PRODUCT
   * --------------
   * Creates a new product with the authenticated user as creator.
   */
  async create(createProductDto: CreateProductDto, user: User): Promise<Product> {
    // Check for duplicate SKU if provided
    if (createProductDto.sku) {
      const existingProduct = await this.productRepository.findOne({
        where: { sku: createProductDto.sku },
      });
      if (existingProduct) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    // Create product entity
    const product = this.productRepository.create({
      ...createProductDto,
      createdById: user.id, // Set the creator
    });

    return this.productRepository.save(product);
  }

  /**
   * FIND ALL WITH PAGINATION & FILTERS
   * ----------------------------------
   * Advanced query with filtering, sorting, and pagination.
   *
   * This demonstrates:
   * - Dynamic query building
   * - Pagination logic
   * - Multiple filter conditions
   */
  async findAll(query: QueryProductDto): Promise<PaginatedResponse<Product>> {
    const {
      search,
      category,
      status,
      minPrice,
      maxPrice,
      featured,
      inStock,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    /**
     * QueryBuilder Approach
     * ---------------------
     * Using QueryBuilder for complex, dynamic queries.
     * 'product' is an alias for the Product entity.
     */
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    /**
     * Search Filter
     * -------------
     * Search in name and description using LIKE.
     * LOWER() for case-insensitive search.
     */
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    /**
     * Category Filter
     * ---------------
     * Exact match on category enum.
     */
    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    /**
     * Status Filter
     * -------------
     * Exact match on status enum.
     */
    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }

    /**
     * Price Range Filter
     * ------------------
     * Between, greater than, or less than.
     */
    if (minPrice !== undefined && maxPrice !== undefined) {
      queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });
    } else if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    /**
     * Featured Filter
     * ---------------
     * Boolean comparison.
     */
    if (featured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :featured', { featured });
    }

    /**
     * In Stock Filter
     * ---------------
     * Check stock > 0 and status is ACTIVE.
     */
    if (inStock) {
      queryBuilder.andWhere('product.stock > 0');
      queryBuilder.andWhere('product.status = :activeStatus', {
        activeStatus: ProductStatus.ACTIVE,
      });
    }

    /**
     * Sorting
     * -------
     * Dynamic sort field and order.
     * Validate sortBy to prevent SQL injection.
     */
    const allowedSortFields = ['name', 'price', 'createdAt', 'updatedAt', 'stock'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`product.${safeSortBy}`, safeSortOrder);

    /**
     * Get Total Count
     * ---------------
     * Count before applying pagination.
     */
    const total = await queryBuilder.getCount();

    /**
     * Pagination
     * ----------
     * skip = offset (how many to skip)
     * take = limit (how many to return)
     *
     * Page 1, Limit 10: skip 0, take 10 (items 1-10)
     * Page 2, Limit 10: skip 10, take 10 (items 11-20)
     */
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const products = await queryBuilder.getMany();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * FIND ONE BY ID
   * --------------
   * Get a single product with its creator info.
   */
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['createdBy'], // Include creator info
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * UPDATE PRODUCT
   * --------------
   * Partial update of product fields.
   */
  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // Check SKU uniqueness if being changed
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingProduct = await this.productRepository.findOne({
        where: { sku: updateProductDto.sku },
      });
      if (existingProduct) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    // Merge updates into existing product
    Object.assign(product, updateProductDto);

    return this.productRepository.save(product);
  }

  /**
   * DELETE PRODUCT
   * --------------
   * Permanently removes a product.
   */
  async remove(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  // ==========================================
  // BUSINESS LOGIC METHODS
  // ==========================================

  /**
   * UPDATE STOCK
   * ------------
   * Business logic for updating product stock.
   * Used when orders are placed or inventory is received.
   *
   * @param id - Product ID
   * @param quantity - Amount to add (positive) or subtract (negative)
   */
  async updateStock(id: number, quantity: number): Promise<Product> {
    const product = await this.findOne(id);

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stock}, Requested: ${Math.abs(quantity)}`,
      );
    }

    product.stock = newStock;

    // Auto-update status based on stock
    if (newStock === 0 && product.status === ProductStatus.ACTIVE) {
      // Optionally set to inactive when out of stock
      // product.status = ProductStatus.INACTIVE;
    }

    return this.productRepository.save(product);
  }

  /**
   * APPLY DISCOUNT
   * --------------
   * Apply a discount percentage to a product.
   *
   * Business Rules:
   * - Discount must be 0-100
   * - Only active products can have discounts
   */
  async applyDiscount(id: number, discountPercent: number): Promise<Product> {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new BadRequestException('Discount must be between 0 and 100');
    }

    const product = await this.findOne(id);

    if (product.status !== ProductStatus.ACTIVE) {
      throw new BadRequestException('Cannot apply discount to inactive products');
    }

    product.discountPercent = discountPercent;
    return this.productRepository.save(product);
  }

  /**
   * GET FEATURED PRODUCTS
   * ---------------------
   * Get products marked as featured.
   * Used for homepage display.
   */
  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    return this.productRepository.find({
      where: {
        isFeatured: true,
        status: ProductStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * GET PRODUCTS BY CATEGORY
   * ------------------------
   * Get all products in a specific category.
   */
  async getByCategory(category: ProductCategory): Promise<Product[]> {
    return this.productRepository.find({
      where: {
        category,
        status: ProductStatus.ACTIVE,
      },
      order: { name: 'ASC' },
    });
  }

  /**
   * GET LOW STOCK PRODUCTS
   * ----------------------
   * Get products with stock below threshold.
   * Useful for inventory management.
   */
  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.stock <= :threshold', { threshold })
      .andWhere('product.stock > 0') // Not completely out of stock
      .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
      .orderBy('product.stock', 'ASC')
      .getMany();
  }

  /**
   * GET PRODUCT STATISTICS
   * ----------------------
   * Aggregate statistics for dashboard.
   */
  async getStatistics(): Promise<{
    totalProducts: number;
    activeProducts: number;
    outOfStock: number;
    byCategory: { category: string; count: number }[];
    averagePrice: number;
  }> {
    // Total products
    const totalProducts = await this.productRepository.count();

    // Active products
    const activeProducts = await this.productRepository.count({
      where: { status: ProductStatus.ACTIVE },
    });

    // Out of stock
    const outOfStock = await this.productRepository.count({
      where: { stock: 0 },
    });

    // Products by category
    const byCategory = await this.productRepository
      .createQueryBuilder('product')
      .select('product.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('product.category')
      .getRawMany();

    // Average price
    const avgResult = await this.productRepository
      .createQueryBuilder('product')
      .select('AVG(product.price)', 'average')
      .getRawOne();

    return {
      totalProducts,
      activeProducts,
      outOfStock,
      byCategory: byCategory.map((item) => ({
        category: item.category,
        count: parseInt(item.count),
      })),
      averagePrice: parseFloat(avgResult.average) || 0,
    };
  }

  /**
   * BULK UPDATE STATUS
   * ------------------
   * Update status for multiple products at once.
   */
  async bulkUpdateStatus(ids: number[], status: ProductStatus): Promise<void> {
    await this.productRepository
      .createQueryBuilder()
      .update(Product)
      .set({ status })
      .whereInIds(ids)
      .execute();
  }
}
