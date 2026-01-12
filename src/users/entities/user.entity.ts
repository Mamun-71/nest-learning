/**
 * ============================================
 * USER.ENTITY.TS - Database Entity
 * ============================================
 *
 * An Entity is a class that maps to a database table.
 * Each instance of the entity represents a row in the table.
 *
 * TYPEORM CONCEPTS:
 *
 * 1. @Entity() Decorator
 *    - Marks a class as a database entity (table)
 *    - Parameter is the table name (optional, defaults to class name)
 *
 * 2. Column Decorators
 *    - @PrimaryGeneratedColumn() - Auto-incrementing primary key
 *    - @Column() - Regular column
 *    - @CreateDateColumn() - Automatically set on create
 *    - @UpdateDateColumn() - Automatically updated on each save
 *
 * 3. Column Options
 *    - type: Data type (varchar, int, text, etc.)
 *    - length: Max length for strings
 *    - unique: Ensures unique values
 *    - nullable: Allows NULL values
 *    - default: Default value
 *
 * 4. Relationships
 *    - @OneToMany, @ManyToOne - One-to-many relationship
 *    - @ManyToMany - Many-to-many relationship
 *    - @OneToOne - One-to-one relationship
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

// Import exclude decorator for hiding sensitive fields in responses
import { Exclude } from 'class-transformer';

// Import the Product entity for the relationship
import { Product } from '../../products/entities/product.entity';

/**
 * User Roles Enum
 * ---------------
 * Defines the possible roles a user can have.
 * Enums provide type safety and prevent invalid values.
 */
export enum UserRole {
  USER = 'user', // Regular user
  ADMIN = 'admin', // Administrator with full access
  MODERATOR = 'moderator', // Moderator with limited admin access
}

/**
 * @Entity('users')
 * ----------------
 * Creates a table named 'users' in the database.
 * The class properties become columns in the table.
 */
@Entity('users')
export class User {
  /**
   * @PrimaryGeneratedColumn()
   * -------------------------
   * Creates an auto-incrementing primary key column.
   *
   * Variants:
   * - @PrimaryGeneratedColumn() - Auto-incrementing integer (1, 2, 3...)
   * - @PrimaryGeneratedColumn('uuid') - UUID string
   * - @PrimaryGeneratedColumn('increment') - Same as default
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * @Column({ unique: true })
   * -------------------------
   * Creates a unique column - no two users can have the same email.
   *
   * Common options:
   * - type: 'varchar' | 'text' | 'int' | 'boolean' | 'datetime' | etc.
   * - length: Maximum length for varchar
   * - unique: true | false
   * - nullable: true | false (default: false)
   * - default: Default value if not provided
   */
  @Column({ unique: true, length: 255 })
  email: string;

  /**
   * @Column() with @Exclude()
   * -------------------------
   * @Exclude() from class-transformer hides this field in responses.
   * When you return a User object, the password won't be included.
   *
   * This requires using ClassSerializerInterceptor globally or per-route.
   */
  @Column({ length: 255 })
  @Exclude() // Hide password in JSON responses
  password: string;

  /**
   * @Column({ type: 'varchar' })
   * ----------------------------
   * First name of the user.
   */
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  /**
   * @Column({ type: 'varchar' })
   * ----------------------------
   * Last name of the user.
   */
  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  /**
   * @Column({ type: 'enum' })
   * -------------------------
   * Enum columns store one value from a predefined set.
   * MySQL creates an ENUM type; other databases may use VARCHAR.
   */
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER, // New users are regular users by default
  })
  role: UserRole;

  /**
   * @Column({ default: true })
   * --------------------------
   * Boolean column with a default value.
   * NULL values not allowed unless you add nullable: true.
   */
  @Column({ default: true })
  isActive: boolean;

  /**
   * @Column({ nullable: true })
   * ---------------------------
   * Optional phone number - can be NULL in the database.
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  /**
   * @CreateDateColumn()
   * -------------------
   * Automatically set to the current timestamp when the entity is created.
   * You don't need to set this manually - TypeORM handles it.
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * @UpdateDateColumn()
   * -------------------
   * Automatically updated to the current timestamp whenever the entity is saved.
   * Tracks when the record was last modified.
   */
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * @OneToMany() Relationship
   * -------------------------
   * Defines a one-to-many relationship with Products.
   * One user can have many products (as creator/owner).
   *
   * Parameters:
   * - First: Function returning the related entity type
   * - Second: Function specifying the inverse relationship on the related entity
   *
   * Note: The "products" array is not stored in the users table.
   * It's populated by querying the products table.
   */
  @OneToMany(() => Product, (product) => product.createdBy)
  products: Product[];

  /**
   * Virtual Property - Full Name
   * ----------------------------
   * Computed property that combines first and last name.
   * Not stored in database, calculated on access.
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
