/**
 * ============================================
 * PRODUCT.ENTITY.TS - Product Database Entity
 * ============================================
 *
 * Represents a product in our e-commerce example.
 * Demonstrates relationships with User entity.
 *
 * RELATIONSHIPS EXPLAINED:
 *
 * @ManyToOne - Many products belong to one user
 * - Product table has a foreign key to User table
 * - Multiple products can reference the same user
 *
 * Relationship Options:
 * - eager: true - Automatically load related entity
 * - lazy: true - Load only when accessed
 * - cascade: true - Cascade operations (insert, update, delete)
 * - onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT'
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Product Status Enum
 * -------------------
 * Defines the lifecycle status of a product.
 */
export enum ProductStatus {
  DRAFT = 'draft', // Not yet published
  ACTIVE = 'active', // Available for purchase
  INACTIVE = 'inactive', // Temporarily unavailable
  DISCONTINUED = 'discontinued', // Permanently removed
}

/**
 * Product Category Enum
 * ---------------------
 * Example categories for products.
 */
export enum ProductCategory {
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  FOOD = 'food',
  BOOKS = 'books',
  OTHER = 'other',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Product Name
   * ------------
   * Required field with max length.
   */
  @Column({ type: 'varchar', length: 200 })
  name: string;

  /**
   * Product Description
   * -------------------
   * Text type for longer content.
   * Nullable because products might be added quickly initially.
   */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  /**
   * Product Price
   * -------------
   * Using decimal for money values (avoids floating-point issues).
   *
   * MySQL DECIMAL(10, 2):
   * - 10 = total digits
   * - 2 = decimal places
   * - Max value: 99,999,999.99
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  /**
   * Stock Quantity
   * --------------
   * Integer for counting items.
   * Default 0 for new products.
   */
  @Column({ type: 'int', default: 0 })
  stock: number;

  /**
   * Product SKU (Stock Keeping Unit)
   * --------------------------------
   * Unique identifier for inventory tracking.
   * Optional but must be unique if provided.
   */
  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  sku: string | null;

  /**
   * Product Category
   * ----------------
   * Enum column with default value.
   */
  @Column({
    type: 'enum',
    enum: ProductCategory,
    default: ProductCategory.OTHER,
  })
  category: ProductCategory;

  /**
   * Product Status
   * --------------
   * Tracks the product lifecycle.
   */
  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  /**
   * Featured Flag
   * -------------
   * For highlighting products on homepage.
   */
  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  /**
   * Discount Percentage
   * -------------------
   * Optional discount (0-100).
   * Nullable to distinguish between 0 discount and no discount.
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercent: number | null;

  /**
   * @ManyToOne Relationship
   * -----------------------
   * Many products can be created by one user.
   *
   * () => User: Returns the related entity class
   * (user) => user.products: The inverse relationship on User entity
   *
   * When we save a Product with createdBy set to a User,
   * TypeORM automatically stores the user's ID in the foreign key column.
   */
  @ManyToOne(() => User, (user) => user.products, {
    eager: false, // Don't auto-load user (we'll load when needed)
    nullable: true, // Product can exist without a creator
    onDelete: 'SET NULL', // If user is deleted, set this to NULL
  })
  @JoinColumn({ name: 'created_by_id' }) // Customize foreign key column name
  createdBy: User | null;

  /**
   * Foreign Key Column
   * ------------------
   * Explicitly define the foreign key column.
   * This allows us to set just the ID without loading the User.
   */
  @Column({ name: 'created_by_id', nullable: true })
  createdById: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Virtual Property - Discounted Price
   * ------------------------------------
   * Calculated property that returns the price after discount.
   */
  get discountedPrice(): number {
    if (!this.discountPercent || this.discountPercent <= 0) {
      return Number(this.price);
    }
    const discount = Number(this.price) * (this.discountPercent / 100);
    return Number(this.price) - discount;
  }

  /**
   * Virtual Property - Is In Stock
   * ------------------------------
   * Quick check if product is available.
   */
  get isInStock(): boolean {
    return this.stock > 0 && this.status === ProductStatus.ACTIVE;
  }
}
