import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MenuItem, MenuItemDocument, MenuCategory } from '../models/MenuItem.schema';
import { CreateMenuItemDto, UpdateMenuItemDto, MenuItemResponseDto } from '../dto/menu-dto';

/**
 * Menu Service
 *
 * Handles all menu item operations
 * User Story: "As an administrator, I want to manage menu items"
 * User Story: "As a customer, I want to browse menu items"
 */
@Injectable()
export class MenuService {
  constructor(
    @InjectModel(MenuItem.name)
    private menuItemModel: Model<MenuItemDocument>,
  ) {}

  /**
   * Create a new menu item (Admin only)
   */
  async create(createMenuItemDto: CreateMenuItemDto): Promise<MenuItemResponseDto> {
    const menuItem = new this.menuItemModel(createMenuItemDto);
    const saved = await menuItem.save();
    return this.mapToResponse(saved);
  }

  /**
   * Get all menu items
   */
  async findAll(filters?: {
    category?: string;
    available?: boolean;
    search?: string;
  }): Promise<MenuItemResponseDto[]> {
    const query: any = {};

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.available !== undefined) {
      query.available = filters.available;
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const items = await this.menuItemModel
      .find(query)
      .sort({ category: 1, name: 1 })
      .lean()
      .exec();

    return items.map(item => this.mapToResponse(item));
  }

  /**
   * Get single menu item by ID
   */
  async findOne(id: string): Promise<MenuItemResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid menu item ID');
    }

    const item = await this.menuItemModel.findById(id).lean().exec();

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    return this.mapToResponse(item);
  }

  /**
   * Get menu items by category
   */
  async findByCategory(category: MenuCategory): Promise<MenuItemResponseDto[]> {
    const items = await this.menuItemModel
      .find({ category, available: true })
      .sort({ orderCount: -1, name: 1 })
      .lean()
      .exec();

    return items.map(item => this.mapToResponse(item));
  }

  /**
   * Get popular menu items
   */
  async findPopular(limit: number = 10): Promise<MenuItemResponseDto[]> {
    const items = await this.menuItemModel
      .find({ available: true })
      .sort({ orderCount: -1, rating: -1 })
      .limit(limit)
      .lean()
      .exec();

    return items.map(item => this.mapToResponse(item));
  }

  /**
   * Update menu item (Admin only)
   */
  async update(id: string, updateMenuItemDto: UpdateMenuItemDto): Promise<MenuItemResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid menu item ID');
    }

    const updated = await this.menuItemModel
      .findByIdAndUpdate(id, updateMenuItemDto, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Menu item not found');
    }

    return this.mapToResponse(updated);
  }

  /**
   * Toggle availability
   */
  async toggleAvailability(id: string): Promise<MenuItemResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid menu item ID');
    }

    const item = await this.menuItemModel.findById(id);

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    item.available = !item.available;
    await item.save();

    return this.mapToResponse(item);
  }

  /**
   * Delete menu item (Admin only)
   */
  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid menu item ID');
    }

    const result = await this.menuItemModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Menu item not found');
    }

    return { message: 'Menu item deleted successfully' };
  }

  /**
   * Increment order count (called when item is ordered)
   */
  async incrementOrderCount(id: string): Promise<void> {
    await this.menuItemModel
      .findByIdAndUpdate(id, { $inc: { orderCount: 1 } })
      .exec();
  }

  /**
   * Update rating (called after feedback)
   */
  async updateRating(id: string, newRating: number): Promise<void> {
    await this.menuItemModel
      .findByIdAndUpdate(id, { rating: newRating })
      .exec();
  }

  /**
   * Map to response DTO
   */
  private mapToResponse(item: any): MenuItemResponseDto {
    return {
      id: item._id.toString(),
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      image: item.image,
      available: item.available,
      preparationTime: item.preparationTime,
      allergens: item.allergens || [],
      tags: item.tags || [],
      calories: item.calories || 0,
      isSpecialOffer: item.isSpecialOffer || false,
      originalPrice: item.originalPrice,
      orderCount: item.orderCount || 0,
      rating: item.rating || 5.0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}

