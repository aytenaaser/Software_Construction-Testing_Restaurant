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
import { ApiProperty } from '@nestjs/swagger';
import { MenuCategory } from '../models/MenuItem.schema';

/**
 * DTO for creating a menu item
 */
export class CreateMenuItemDto {
  @ApiProperty({
    description: 'Name of the menu item',
    example: 'Grilled Salmon',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the menu item',
    example: 'Fresh Atlantic salmon grilled to perfection with lemon butter sauce',
    required: true,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Menu category',
    example: 'main_course',
    enum: ['appetizer', 'main_course', 'dessert', 'beverage', 'side'],
    enumName: 'MenuCategory',
    required: true,
  })
  @IsEnum(MenuCategory)
  category: MenuCategory;

  @ApiProperty({
    description: 'Price of the menu item',
    example: 24.99,
    minimum: 0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Image URL of the menu item',
    example: 'https://example.com/images/grilled-salmon.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    description: 'Preparation time in minutes',
    example: 15,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preparationTime?: number;

  @ApiProperty({
    description: 'List of allergens in the dish',
    example: ['fish', 'dairy'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @ApiProperty({
    description: 'Tags for the menu item',
    example: ['gluten-free', 'healthy', 'chef-special'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Calories in the dish',
    example: 450,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  calories?: number;

  @ApiProperty({
    description: 'Whether this is a special offer',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isSpecialOffer?: boolean;

  @ApiProperty({
    description: 'Original price before discount (if special offer)',
    example: 29.99,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;
}

/**
 * DTO for updating a menu item
 */
export class UpdateMenuItemDto {
  @ApiProperty({
    description: 'Name of the menu item',
    example: 'Grilled Salmon',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Description of the menu item',
    example: 'Fresh Atlantic salmon grilled to perfection with lemon butter sauce',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Menu category',
    example: 'main_course',
    enum: ['appetizer', 'main_course', 'dessert', 'beverage', 'side'],
    enumName: 'MenuCategory',
    required: false,
  })
  @IsOptional()
  @IsEnum(MenuCategory)
  category?: MenuCategory;

  @ApiProperty({
    description: 'Price of the menu item',
    example: 24.99,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({
    description: 'Image URL of the menu item',
    example: 'https://example.com/images/grilled-salmon.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    description: 'Whether the item is available',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @ApiProperty({
    description: 'Preparation time in minutes',
    example: 15,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preparationTime?: number;

  @ApiProperty({
    description: 'List of allergens in the dish',
    example: ['fish', 'dairy'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @ApiProperty({
    description: 'Tags for the menu item',
    example: ['gluten-free', 'healthy', 'chef-special'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Calories in the dish',
    example: 450,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  calories?: number;

  @ApiProperty({
    description: 'Whether this is a special offer',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isSpecialOffer?: boolean;

  @ApiProperty({
    description: 'Original price before discount (if special offer)',
    example: 29.99,
    minimum: 0,
    required: false,
  })
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

