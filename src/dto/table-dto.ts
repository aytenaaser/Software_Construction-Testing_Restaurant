/**
 * DTOs for Table operations
 * Follows Single Responsibility Principle - only validates input/output data
 */
import {
  IsNumber,
  IsBoolean,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TableLocation } from '../models/Table.schema';

/**
 * DTO for creating a new table
 */
export class CreateTableDto {
  @ApiProperty({
    description: 'Unique table number/identifier',
    example: 'T1',
    required: true
  })
  @IsString({ message: 'Table number must be a string' })
  @IsNotEmpty({ message: 'Table number is required' })
  tableNumber: string;

  @ApiProperty({
    description: 'Number of people the table can accommodate',
    example: 4,
    minimum: 1,
    maximum: 20
  })
  @IsNumber({}, { message: 'Capacity must be a number' })
  @Min(1, { message: 'Capacity must be at least 1' })
  @Max(20, { message: 'Capacity cannot exceed 20' })
  capacity: number;

  @ApiProperty({
    description: 'Table location (select from dropdown)',
    example: 'indoor',
    enum: ['indoor', 'outdoor', 'window_side', 'private_room'],
    enumName: 'TableLocation',
    required: true,
  })
  @IsEnum(TableLocation, { message: 'Location must be one of: indoor, outdoor, window_side, private_room' })
  location: TableLocation;

  @ApiProperty({
    description: 'Floor where the table is located',
    example: 'Ground Floor',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Floor must be a string' })
  floor?: string;

  @ApiProperty({
    description: 'Table position coordinates for 2D layout',
    example: { x: 10, y: 20 },
    required: false
  })
  @IsOptional()
  position?: { x: number; y: number };

  @ApiProperty({
    description: 'Table shape for visualization',
    example: 'circle',
    enum: ['circle', 'square', 'rectangle'],
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Shape must be a string' })
  shape?: string;

  @ApiProperty({
    description: 'Whether the table is available for booking',
    example: true,
    default: true,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'isAvailable must be a boolean' })
  isAvailable?: boolean;
}

/**
 * DTO for updating a table
 * All fields are optional for partial updates
 */
export class UpdateTableDto {
  @ApiProperty({
    description: 'Unique table number/identifier',
    example: 'T1',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Table number must be a string' })
  @IsNotEmpty({ message: 'Table number cannot be empty' })
  tableNumber?: string;

  @ApiProperty({
    description: 'Number of people the table can accommodate',
    example: 4,
    minimum: 1,
    maximum: 20,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'Capacity must be a number' })
  @Min(1, { message: 'Capacity must be at least 1' })
  @Max(20, { message: 'Capacity cannot exceed 20' })
  capacity?: number;

  @ApiProperty({
    description: 'Table location (select from dropdown)',
    example: 'indoor',
    enum: ['indoor', 'outdoor', 'window_side', 'private_room'],
    enumName: 'TableLocation',
    required: false,
  })
  @IsOptional()
  @IsEnum(TableLocation, { message: 'Location must be one of: indoor, outdoor, window_side, private_room' })
  location?: TableLocation;

  @ApiProperty({
    description: 'Floor where the table is located',
    example: 'Ground Floor',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Floor must be a string' })
  floor?: string;

  @ApiProperty({
    description: 'Table position coordinates for 2D layout',
    example: { x: 10, y: 20 },
    required: false
  })
  @IsOptional()
  position?: { x: number; y: number };

  @ApiProperty({
    description: 'Table shape for visualization',
    example: 'circle',
    enum: ['circle', 'square', 'rectangle'],
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Shape must be a string' })
  shape?: string;

  @ApiProperty({
    description: 'Whether the table is available for booking',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'isAvailable must be a boolean' })
  isAvailable?: boolean;
}

