import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsMongoId,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for order item
 */
export class OrderItemDto {
  @ApiProperty({
    description: 'Menu item ID from the menu',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsMongoId()
  menuItemId: string;

  @ApiProperty({
    description: 'Quantity of the menu item',
    example: 2,
    minimum: 1,
    required: true,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Special instructions for this item (e.g., "No onions", "Extra spicy")',
    example: 'No onions, please',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiProperty({
    description: 'Allergy notes for this item',
    example: 'Allergic to peanuts',
    required: false,
  })
  @IsOptional()
  @IsString()
  allergyNote?: string;
}

/**
 * DTO for creating a pre-order
 */
export class CreateMenuOrderDto {
  @ApiProperty({
    description: 'Array of menu items to order',
    type: [OrderItemDto],
    example: [
      {
        menuItemId: '507f1f77bcf86cd799439011',
        quantity: 2,
        specialInstructions: 'Well done',
        allergyNote: 'No nuts'
      },
      {
        menuItemId: '507f1f77bcf86cd799439012',
        quantity: 1,
        specialInstructions: 'Extra cheese'
      }
    ],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'General special requests for the entire order',
    example: 'Please serve all dishes at the same time',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @ApiProperty({
    description: 'Dietary restrictions or preferences',
    example: 'Vegetarian, gluten-free',
    required: false,
  })
  @IsOptional()
  @IsString()
  dietaryRestrictions?: string;
}

/**
 * DTO for updating a pre-order
 */
export class UpdateMenuOrderDto {
  @ApiProperty({
    description: 'Array of menu items to order',
    type: [OrderItemDto],
    example: [
      {
        menuItemId: '507f1f77bcf86cd799439011',
        quantity: 2,
        specialInstructions: 'Well done'
      }
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  @ApiProperty({
    description: 'General special requests for the entire order',
    example: 'Please serve all dishes at the same time',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @ApiProperty({
    description: 'Dietary restrictions or preferences',
    example: 'Vegetarian, gluten-free',
    required: false,
  })
  @IsOptional()
  @IsString()
  dietaryRestrictions?: string;
}

/**
 * DTO for updating order status (Staff)
 */
export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Order status',
    example: 'confirmed',
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'],
    enumName: 'OrderStatus',
    required: true,
  })
  @IsString()
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
}

/**
 * Response DTO for order item
 */
export class OrderItemResponseDto {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
  allergyNote?: string;
}

/**
 * Response DTO for menu order
 */
export class MenuOrderResponseDto {
  id: string;
  reservationId: string;
  userId: string;
  items: OrderItemResponseDto[];
  totalAmount: number;
  status: string;
  estimatedPreparationTime?: number;
  specialRequests?: string;
  dietaryRestrictions?: string;
  isPaid: boolean;
  confirmedAt?: Date;
  preparedAt?: Date;
  servedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

