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
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TableService } from '../services/table.service';
import { CreateTableDto, UpdateTableDto } from '../dto/table-dto';
import { JwtAuthGuard } from '../auth/guards/authentication-guard';
import { RolesGuard } from '../auth/guards/authorization-guard';
import { Roles } from '../auth/decorators/roles-decorator';
import { UserRole } from '../models/user.schema';

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
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTableDto: CreateTableDto) {
    return this.tableService.create(createTableDto);
  }

  /**
   * Get all tables
   * GET /tables
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return this.tableService.findAll();
  }

  /**
   * Get available tables
   * GET /tables/available
   */
  @Get('available')
  @HttpCode(HttpStatus.OK)
  async findAvailable() {
    return this.tableService.findAvailable();
  }

  /**
   * Get table by ID
   * GET /tables/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    return this.tableService.findById(id);
  }

  /**
   * Update table (Admin only)
   * PUT /tables/:id
   */
  @Put(':id')
  @Roles(UserRole.ADMIN)
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.tableService.delete(id);
  }
}

