/**
 * User Controller
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles HTTP request/response for users
 * - Open/Closed: Can add new endpoints without modifying existing ones
 * - Dependency Inversion: Depends on UsersService abstraction
 *
 * Responsibilities:
 * - HTTP request handling
 * - Route definition
 * - Authorization with guards and decorators
 * - Delegate business logic to service layer
 *
 * Programming Paradigms:
 * - DECLARATIVE: Route decorators define behavior
 * - IMPERATIVE: Request handlers call service methods
 */
import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from '../services/user.service';
import { UserRole } from '../models/user.schema';
import { RolesGuard } from '../auth/guards/authorization-guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles-decorator';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * IMPERATIVE: Get user profile
   * Delegates to service layer
   */
  @Get('profile')
  async getProfile(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.usersService.findById(req.user.userId);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateUserDto: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('staff')
  @Roles(UserRole.ADMIN)
  async getStaffMembers() {
    return this.usersService.getStaffMembers();
  }

  @Get('customers')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getCustomers() {
    return this.usersService.getCustomers();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id/role')
  @Roles(UserRole.ADMIN)
  async updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.updateRole(id, role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
