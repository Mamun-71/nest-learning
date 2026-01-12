/**
 * ============================================
 * USERS.MODULE.TS - User Feature Module
 * ============================================
 *
 * Feature modules encapsulate related functionality.
 * The UsersModule contains everything related to users:
 * - Entity (database table)
 * - DTO (data validation)
 * - Service (business logic)
 * - Controller (HTTP endpoints)
 *
 * MODULE ORGANIZATION:
 *
 * A typical feature module structure:
 * users/
 * ├── dto/                    # Data Transfer Objects
 * │   ├── create-user.dto.ts
 * │   └── update-user.dto.ts
 * ├── entities/               # TypeORM entities
 * │   └── user.entity.ts
 * ├── users.controller.ts     # HTTP request handlers
 * ├── users.service.ts        # Business logic
 * └── users.module.ts         # Module definition
 *
 * TypeOrmModule.forFeature():
 * - Registers entities for this module
 * - Creates a Repository for each entity
 * - Repositories can be injected using @InjectRepository()
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  /**
   * IMPORTS
   * -------
   * TypeOrmModule.forFeature([User])
   *
   * This does two things:
   * 1. Tells TypeORM about the User entity
   * 2. Creates a Repository<User> that can be injected
   *
   * In UsersService, we use:
   * @InjectRepository(User)
   * private userRepository: Repository<User>
   */
  imports: [TypeOrmModule.forFeature([User])],

  /**
   * CONTROLLERS
   * -----------
   * List of controllers that handle HTTP requests.
   * NestJS registers routes defined in these controllers.
   */
  controllers: [UsersController],

  /**
   * PROVIDERS
   * ---------
   * Services and other injectable classes for this module.
   * These are available for injection within this module.
   */
  providers: [UsersService],

  /**
   * EXPORTS
   * -------
   * Providers to share with other modules.
   *
   * We export UsersService so the AuthModule can use it
   * to find users during login.
   *
   * Without this export, UsersService would only be
   * available within UsersModule.
   */
  exports: [UsersService],
})
export class UsersModule {}
