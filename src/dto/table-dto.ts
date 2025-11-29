/**
 * DTOs for Table operations
 * Follows Single Responsibility Principle - only validates input/output data
 */
import {
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

/**
 * DTO for creating a new table
 */
export class CreateTableDto {
  @IsNumber({}, { message: 'Capacity must be a number' })
  @Min(1, { message: 'Capacity must be at least 1' })
  @Max(20, { message: 'Capacity cannot exceed 20' })
  capacity: number;

  @IsOptional()
  @IsBoolean({ message: 'isAvailable must be a boolean' })
  isAvailable?: boolean;
}

/**
 * DTO for updating a table
 * All fields are optional for partial updates
 */
export class UpdateTableDto {
  @IsOptional()
  @IsNumber({}, { message: 'Capacity must be a number' })
  @Min(1, { message: 'Capacity must be at least 1' })
  @Max(20, { message: 'Capacity cannot exceed 20' })
  capacity?: number;

  @IsOptional()
  @IsBoolean({ message: 'isAvailable must be a boolean' })
  isAvailable?: boolean;
}

