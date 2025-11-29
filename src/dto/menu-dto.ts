import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { MenuCategory } from '../models/MenuItem.schema';

/**
 * DTO for creating a menu item
 */
export class CreateMenuItemDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(MenuCategory)
  category: MenuCategory;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  preparationTime?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  calories?: number;

  @IsOptional()
  @IsBoolean()
  isSpecialOffer?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;
}

/**
 * DTO for updating a menu item
 */
export class UpdateMenuItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(MenuCategory)
  category?: MenuCategory;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  preparationTime?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  calories?: number;

  @IsOptional()
  @IsBoolean()
  isSpecialOffer?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;
}

/**
 * Response DTO for menu items
 */
export class MenuItemResponseDto {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image?: string;
  available: boolean;
  preparationTime?: number;
  allergens: string[];
  tags: string[];
  calories: number;
  isSpecialOffer: boolean;
  originalPrice?: number;
  orderCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

