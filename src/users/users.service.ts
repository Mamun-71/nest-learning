/**
 * ============================================
 * USERS.SERVICE.TS - User Business Logic
 * ============================================
 *
 * This service handles all user-related business logic:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Password hashing
 * - User lookup for authentication
 *
 * TYPEORM REPOSITORY PATTERN:
 *
 * TypeORM provides a Repository class for database operations.
 * We inject it using @InjectRepository() decorator.
 *
 * Repository Methods:
 * - find() - Find multiple records
 * - findOne() - Find a single record
 * - create() - Create a new entity instance (doesn't save)
 * - save() - Save entity to database (insert or update)
 * - update() - Update record(s) by condition
 * - delete() - Delete record(s)
 * - remove() - Remove an entity instance
 *
 * QUERY OPTIONS:
 * - where: Filter conditions
 * - select: Choose which fields to return
 * - relations: Include related entities
 * - order: Sort results
 * - take/skip: Pagination
 */

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  /**
   * Constructor - Dependency Injection
   * ----------------------------------
   * @InjectRepository(User) tells NestJS to inject the User repository.
   * This gives us access to all database operations for the User entity.
   */
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * CREATE - Add New User
   * ---------------------
   * Creates a new user in the database.
   *
   * Steps:
   * 1. Check if email already exists (must be unique)
   * 2. Hash the password using bcrypt
   * 3. Create and save the user entity
   * 4. Return the user without the password
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Step 1: Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      // ConflictException returns HTTP 409 status
      throw new ConflictException('Email already exists');
    }

    // Step 2: Hash the password
    const saltRounds =
      this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Step 3: Create user entity (doesn't save yet)
    const user = this.userRepository.create({
      ...createUserDto, // Spread all DTO properties
      password: hashedPassword, // Override with hashed password
    });

    // Step 4: Save to database and return
    // save() returns the saved entity with generated id
    const savedUser = await this.userRepository.save(user);

    // Remove password from response (extra safety)
    // Using destructuring to exclude password from returned object
    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  /**
   * FIND ALL - Get All Users
   * ------------------------
   * Retrieves all users from the database.
   *
   * Options:
   * - select: We exclude the password field
   * - Could add pagination, filtering, sorting here
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      // Select all fields except password
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'role',
        'isActive',
        'phone',
        'createdAt',
        'updatedAt',
      ],
      // Order by creation date, newest first
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * FIND ONE - Get User by ID
   * -------------------------
   * Retrieves a single user by their ID.
   *
   * @throws NotFoundException if user doesn't exist
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'role',
        'isActive',
        'phone',
        'createdAt',
        'updatedAt',
      ],
      // Include related products
      relations: ['products'],
    });

    if (!user) {
      // NotFoundException returns HTTP 404 status
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * FIND BY EMAIL - For Authentication
   * ----------------------------------
   * Finds a user by email address.
   * Used during login to verify credentials.
   *
   * NOTE: This method INCLUDES the password for authentication.
   * Don't expose this in regular user endpoints!
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  /**
   * UPDATE - Modify User
   * --------------------
   * Updates an existing user with new data.
   *
   * Steps:
   * 1. Find the existing user
   * 2. Check email uniqueness if changing email
   * 3. Merge new data with existing
   * 4. Save and return updated user
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Step 1: Find existing user
    const user = await this.findOne(id);

    // Step 2: If email is being changed, check uniqueness
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }

    // Step 3: Merge new data into existing user
    // Object.assign() copies properties from updateUserDto to user
    Object.assign(user, updateUserDto);

    // Step 4: Save and return
    const updatedUser = await this.userRepository.save(user);
    // Using destructuring to exclude password from returned object
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }

  /**
   * UPDATE PASSWORD - Special Method
   * --------------------------------
   * Separate endpoint for password updates.
   * Requires current password verification.
   */
  async updatePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // Find user WITH password (need it for verification)
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds =
      this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.userRepository.update(id, { password: hashedPassword });
  }

  /**
   * DELETE (SOFT) - Deactivate User
   * -------------------------------
   * Instead of deleting, we deactivate the user.
   * This preserves data for audit trails and recovery.
   *
   * For hard delete, use: await this.userRepository.delete(id);
   */
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);

    // Soft delete: Set isActive to false
    user.isActive = false;
    await this.userRepository.save(user);
  }

  /**
   * HARD DELETE - Permanently Remove
   * --------------------------------
   * Actually removes the user from the database.
   * Use with caution!
   */
  async hardDelete(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);

    // result.affected is the number of rows deleted
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  /**
   * BUSINESS LOGIC EXAMPLE - Get User Statistics
   * --------------------------------------------
   * Example of business logic that goes beyond CRUD.
   * This calculates statistics for a user.
   */
  async getUserStatistics(id: number): Promise<{
    user: User;
    totalProducts: number;
    accountAge: number;
  }> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['products'],
      select: ['id', 'email', 'firstName', 'lastName', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Calculate account age in days
    const now = new Date();
    const created = new Date(user.createdAt);
    const accountAge = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      user,
      totalProducts: user.products?.length || 0,
      accountAge,
    };
  }
}
