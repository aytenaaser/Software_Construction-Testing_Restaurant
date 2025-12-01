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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { MenuService } from '../services/menu.service';
import { CreateMenuItemDto, UpdateMenuItemDto, MenuItemResponseDto } from '../dto/menu-dto';
import { JwtAuthGuard } from '../auth/guards/authentication-guard';
import { RolesGuard } from '../auth/guards/authorization-guard';
import { Roles } from '../auth/decorators/roles-decorator';
import { UserRole } from '../models/user.schema';
import { Public } from '../auth/decorators/public-decorator';

/**
 * Menu Controller
 *
 * Handles menu management endpoints
 * Public endpoints for viewing, protected endpoints for management
 */
@ApiTags('Menu')
@Controller('menu')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  /**
   * Create menu item (Admin only)
   * POST /menu
   */
  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMenuItemDto: CreateMenuItemDto): Promise<MenuItemResponseDto> {
    return this.menuService.create(createMenuItemDto);
  }

  /**
   * Get all menu items (Public)
   * GET /menu - Get ALL menu items (no parameters required)
   * GET /menu?category=appetizer - Filter by category (optional)
   * GET /menu?available=true - Filter by availability (optional)
   * GET /menu?search=pasta - Search by name/description (optional)
   * All query parameters are optional - can be used together or omitted entirely
   */
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all menu items',
    description: 'Public endpoint - Get all menu items. All query parameters are optional. Call without parameters to get the complete menu.'
  })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category (appetizer, main, dessert, beverage)', example: 'main' })
  @ApiQuery({ name: 'available', required: false, description: 'Filter by availability (true/false)', example: 'true' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in name and description', example: 'pasta' })
  @ApiResponse({ status: 200, description: 'List of menu items (all items if no filters provided)' })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('category') category?: string,
    @Query('available') available?: string,
    @Query('search') search?: string,
  ): Promise<MenuItemResponseDto[]> {
    const filters: any = {};

    if (category) filters.category = category;
    if (available !== undefined) filters.available = available === 'true';
    if (search) filters.search = search;

    return this.menuService.findAll(filters);
  }

  /**
   * Get popular items (Public)
   * GET /menu/popular?limit=10
   */
  @Public()
  @Get('popular')
  @HttpCode(HttpStatus.OK)
  async findPopular(@Query('limit') limit?: string): Promise<MenuItemResponseDto[]> {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.menuService.findPopular(limitNum);
  }

  /**
   * Get menu items by category (Public)
   * GET /menu/category/:category
   */
  @Public()
  @Get('category/:category')
  @HttpCode(HttpStatus.OK)
  async findByCategory(@Param('category') category: string): Promise<MenuItemResponseDto[]> {
    return this.menuService.findByCategory(category as any);
  }

  /**
   * Get single menu item (Public)
   * GET /menu/:id
   */
  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<MenuItemResponseDto> {
    return this.menuService.findOne(id);
  }

  /**
   * Update menu item (Admin only)
   * PUT /menu/:id
   */
  @Put(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ): Promise<MenuItemResponseDto> {
    return this.menuService.update(id, updateMenuItemDto);
  }

  /**
   * Toggle availability (Admin only)
   * PUT /menu/:id/toggle-availability
   */
  @Put(':id/toggle-availability')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async toggleAvailability(@Param('id') id: string): Promise<MenuItemResponseDto> {
    return this.menuService.toggleAvailability(id);
  }

  /**
   * Delete menu item (Admin only)
   * DELETE /menu/:id
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.menuService.remove(id);
  }
}

