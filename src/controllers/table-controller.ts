/**
 * Table Controller
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles HTTP request/response for tables
 * - Open/Closed: Can add new endpoints without modifying existing ones
 * - Dependency Inversion: Depends on TableService abstraction
 *
 * Responsibilities:
 * - HTTP request handling for table CRUD operations
 * - Route definition
 * - Authorization with guards and decorators
 * - Delegate business logic to service layer
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TableService } from '../services/table.service';
import { CreateTableDto, UpdateTableDto } from '../dto/table-dto';
import { JwtAuthGuard } from '../auth/guards/authentication-guard';
import { RolesGuard } from '../auth/guards/authorization-guard';
import { Roles } from '../auth/decorators/roles-decorator';
import { UserRole } from '../models/user.schema';
import { Public } from '../auth/decorators/public-decorator';

@ApiTags('Tables')
@Controller('tables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TableController {
  constructor(private readonly tableService: TableService) {}

  /**
   * Create a new table (Admin only)
   * POST /tables
   */
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Create a new table',
    description: 'Admin only - Create a new table in the restaurant'
  })
  @ApiResponse({ status: 201, description: 'Table created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required.' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTableDto: CreateTableDto) {
    return this.tableService.create(createTableDto);
  }

  /**
   * Get all tables (Public - for customers to see layout)
   * GET /tables
   */
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all tables',
    description: 'Public endpoint - Get all tables in the restaurant with their details'
  })
  @ApiResponse({ status: 200, description: 'List of all tables.' })
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return this.tableService.findAll();
  }

  /**
   * Get available tables (Public - for customers to check availability)
   * GET /tables/available
   */
  @Public()
  @Get('available')
  @ApiOperation({
    summary: 'Get available tables',
    description: 'Get available tables for a specific date and time range'
  })
  @ApiQuery({ name: 'date', required: true, description: 'Date in DD/MM/YYYY format', example: '15/12/2025' })
  @ApiQuery({ name: 'fromHour', required: true, description: 'Start hour (0-23)', example: 10 })
  @ApiQuery({ name: 'toHour', required: true, description: 'End hour (0-23)', example: 12 })
  @ApiResponse({ status: 200, description: 'List of available tables.' })
  @HttpCode(HttpStatus.OK)
  async findAvailable(
    @Query('date') date: string,
    @Query('fromHour') fromHourStr: string,
    @Query('toHour') toHourStr: string,
  ) {
    const fromHour = parseInt(fromHourStr, 10);
    const toHour = parseInt(toHourStr, 10);

    if (isNaN(fromHour) || isNaN(toHour)) {
      throw new BadRequestException('fromHour and toHour must be valid numbers');
    }

    return this.tableService.findAvailable(date, fromHour, toHour);
  }

  /**
   * Get table by ID (Public - for customers to see table details)
   * GET /tables/:id
   */
  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get table by ID',
    description: 'Public endpoint - Get details of a specific table'
  })
  @ApiResponse({ status: 200, description: 'Table details.' })
  @ApiResponse({ status: 404, description: 'Table not found.' })
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    return this.tableService.findById(id);
  }

  /**
   * Update table (Admin and Staff)
   * PUT /tables/:id
   */
  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Update table',
    description: 'Admin and Staff - Update table details or status (availability, status, etc.)'
  })
  @ApiResponse({ status: 200, description: 'Table updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Staff access required.' })
  @ApiResponse({ status: 404, description: 'Table not found.' })
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateTableDto: UpdateTableDto) {
    return this.tableService.update(id, updateTableDto);
  }

  /**
   * Delete table (Admin only)
   * DELETE /tables/:id
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Delete table',
    description: 'Admin only - Remove a table from the restaurant'
  })
  @ApiResponse({ status: 204, description: 'Table deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required.' })
  @ApiResponse({ status: 404, description: 'Table not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.tableService.delete(id);
  }
}

