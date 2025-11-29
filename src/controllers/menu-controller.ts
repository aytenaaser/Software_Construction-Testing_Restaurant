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
   * GET /menu?category=appetizer&available=true&search=pasta
   */
  @Public()
  @Get()
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

