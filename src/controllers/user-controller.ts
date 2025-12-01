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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UsersService } from '../services/user.service';
import { UserRole } from '../models/user.schema';
import { RolesGuard } from '../auth/guards/authorization-guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles-decorator';
import { UpdateProfileDto } from '../dto/user-dto';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * Get current user's profile
   * Requires authentication
   */
  @Get('profile')
  @ApiOperation({
    summary: 'Get my profile',
    description: 'Get the profile of the currently logged-in user'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'customer',
        phone: '+1234567890',
        isEmailVerified: true,
        createdAt: '2025-11-29T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - not logged in.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getProfile(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.usersService.findById(req.user.sub);
  }

  /**
   * Update current user's profile
   * Users can update their own name, email, phone, password
   * Cannot change role (only admins can do that)
   */
  @Put('profile')
  @ApiOperation({
    summary: 'Update my profile',
    description: 'Update the profile of the currently logged-in user. Can update name, email, phone, and password. Cannot change role.'
  })
  @ApiBody({
    type: UpdateProfileDto,
    description: 'Profile update data. All fields are optional - only provide fields you want to update.',
    examples: {
      'Update Name': {
        value: {
          name: 'Jane Doe'
        }
      },
      'Update Email and Phone': {
        value: {
          email: 'jane.doe@example.com',
          phone: '+9876543210'
        }
      },
      'Change Password': {
        value: {
          password: 'NewSecurePass123'
        }
      },
      'Update All Fields': {
        value: {
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          phone: '+9876543210',
          password: 'NewSecurePass123'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully.',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        role: 'customer',
        phone: '+9876543210',
        isEmailVerified: true,
        updatedAt: '2025-11-29T12:30:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - validation failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - not logged in.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.usersService.update(req.user.sub, updateProfileDto);
  }

  /**
   * Get all users (Admin only)
   */
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Admin only - Get a list of all users in the system'
  })
  @ApiResponse({ status: 200, description: 'List of all users.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required.' })
  async findAll() {
    return this.usersService.findAll();
  }

  /**
   * Get all staff members (Admin only)
   */
  @Get('staff')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all staff members',
    description: 'Admin only - Get a list of all staff members'
  })
  @ApiResponse({ status: 200, description: 'List of staff members.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required.' })
  async getStaffMembers() {
    return this.usersService.getStaffMembers();
  }

  /**
   * Get all customers (Admin/Staff)
   */
  @Get('customers')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: 'Get all customers',
    description: 'Admin/Staff only - Get a list of all customers'
  })
  @ApiResponse({ status: 200, description: 'List of customers.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin/Staff access required.' })
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
