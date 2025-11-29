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

/**
 * DTO for order item
 */
export class OrderItemDto {
  @IsMongoId()
  menuItemId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsString()
  allergyNote?: string;
}

/**
 * DTO for creating a pre-order
 */
export class CreateMenuOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsOptional()
  @IsString()
  dietaryRestrictions?: string;
}

/**
 * DTO for updating a pre-order
 */
export class UpdateMenuOrderDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsOptional()
  @IsString()
  dietaryRestrictions?: string;
}

/**
 * DTO for updating order status (Staff)
 */
export class UpdateOrderStatusDto {
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

