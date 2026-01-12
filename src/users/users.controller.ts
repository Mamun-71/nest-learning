/**
 * ============================================
 * USERS.CONTROLLER.TS - HTTP Endpoints
 * ============================================
 *
 * This controller handles all HTTP requests for user operations.
 *
 * ROUTE STRUCTURE:
 * - GET    /users          -> findAll()    - Get all users
 * - GET    /users/:id      -> findOne()    - Get one user
 * - GET    /users/:id/stats -> getStats()  - Get user statistics
 * - POST   /users          -> create()     - Create new user
 * - PATCH  /users/:id      -> update()     - Update user
 * - DELETE /users/:id      -> remove()     - Delete user
 *
 * PARAMETER DECORATORS:
 * - @Param('id') - Get URL parameter (e.g., /users/123 -> id = '123')
 * - @Body() - Get request body (POST/PATCH data)
 * - @Query() - Get query parameters (e.g., ?page=1&limit=10)
 * - @Headers() - Get request headers
 *
 * HTTP STATUS CODES:
 * - 200 OK - Successful GET, PUT, PATCH
 * - 201 Created - Successful POST
 * - 204 No Content - Successful DELETE
 * - 400 Bad Request - Validation errors
 * - 401 Unauthorized - Not authenticated
 * - 403 Forbidden - Not authorized
 * - 404 Not Found - Resource doesn't exist
 * - 409 Conflict - Resource already exists
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

/**
 * @Controller('users')
 * --------------------
 * All routes in this controller start with /users
 */
@Controller('users')
export class UsersController {
  /**
   * Constructor - Inject UsersService
   * ---------------------------------
   * The controller delegates all business logic to the service.
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /users - Create New User
   * -----------------------------
   * Public endpoint for user registration.
   *
   * @Body() automatically:
   * 1. Parses the JSON request body
   * 2. Validates it against CreateUserDto
   * 3. Returns 400 Bad Request if validation fails
   * 4. Passes the validated DTO to the handler
   *
   * @HttpCode(HttpStatus.CREATED) sets response status to 201
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * GET /users - Get All Users
   * --------------------------
   * Protected endpoint - requires authentication.
   *
   * @UseGuards() applies guards that check:
   * 1. JwtAuthGuard - Is the user authenticated?
   * 2. RolesGuard - Does the user have the required role?
   *
   * @Roles() specifies which roles can access this endpoint.
   * Only ADMIN and MODERATOR can list all users.
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * GET /users/:id - Get User by ID
   * -------------------------------
   * Protected endpoint - requires authentication.
   *
   * @Param('id') extracts the 'id' from the URL.
   *
   * ParseIntPipe transforms the string '123' to number 123.
   * If the value is not a valid integer, returns 400 Bad Request.
   *
   * Pipeline Process:
   * URL: /users/123
   *   -> Extract 'id' = '123' (string)
   *   -> ParseIntPipe transforms to 123 (number)
   *   -> Handler receives id = 123
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  /**
   * GET /users/:id/stats - Get User Statistics
   * ------------------------------------------
   * Example of a custom endpoint with business logic.
   *
   * Protected for authenticated users only.
   */
  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  getStatistics(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserStatistics(id);
  }

  /**
   * PATCH /users/:id - Update User
   * ------------------------------
   * Protected endpoint - requires authentication.
   *
   * PATCH is for partial updates (only changed fields).
   * PUT would be for full replacement (all fields required).
   *
   * UpdateUserDto has all fields optional due to PartialType.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * DELETE /users/:id - Delete User
   * -------------------------------
   * Protected endpoint - only ADMIN can delete users.
   *
   * @HttpCode(HttpStatus.NO_CONTENT) returns 204 No Content.
   * This is standard for DELETE operations - no body in response.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
