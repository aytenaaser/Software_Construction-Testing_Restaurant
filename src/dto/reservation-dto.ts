import {
  IsString,
  IsEmail,
  IsNumber,
  IsMongoId,
  IsOptional,
  IsEnum,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TableLocation } from '../models/Table.schema';

/**
 * DTO for creating a new reservation
 * Follows Single Responsibility Principle - only validates input data
 * Note: customerEmail is NOT included - it's taken from authenticated user's profile
 * Date format: DD/MM/YYYY
 * Time format: HH:MM
 */
export class CreateReservationDto {
  @ApiProperty({
    description: 'Customer full name',
    example: 'John Doe',
  })
  @IsString({ message: 'Customer name must be a string' })
  customerName: string;

  @ApiProperty({
    description: 'Reservation date in DD/MM/YYYY format',
    example: '15/12/2025',
    pattern: '^\\d{2}/\\d{2}/\\d{4}$',
  })
  @IsString({ message: 'Reservation date must be a string' })
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'Reservation date must be in DD/MM/YYYY format (e.g., 15/12/2025)',
  })
  reservationDate: string;

  @ApiProperty({
    description: 'Reservation time in HH:MM format (24-hour)',
    example: '19:30',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
  })
  @IsString({ message: 'Reservation time must be a string' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Reservation time must be in HH:MM format (e.g., 19:30)',
  })
  reservationTime: string;

  @ApiProperty({
    description: 'Number of guests',
    example: 4,
    minimum: 1,
    maximum: 20,
  })
  @IsNumber({}, { message: 'Party size must be a number' })
  @Min(1, { message: 'Party size must be at least 1' })
  @Max(20, { message: 'Party size cannot exceed 20' })
  partySize: number;

  @ApiProperty({
    description: 'Preferred table location',
    example: 'indoor',
    enum: ['indoor', 'outdoor', 'window_side', 'private_room'],
    enumName: 'TableLocation',
    required: false,
  })
  @IsOptional()
  @IsEnum(TableLocation, { message: 'Location must be one of: indoor, outdoor, window_side, private_room' })
  locationPreference?: TableLocation;
}

/**
 * DTO for updating a reservation
 * All fields are optional for partial updates
 * Date format: DD/MM/YYYY
 * Time format: HH:MM
 */
export class UpdateReservationDto {
  @ApiProperty({
    description: 'Customer full name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Customer name must be a string' })
  customerName?: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  customerEmail?: string;

  @ApiProperty({
    description: 'Reservation date in DD/MM/YYYY format',
    example: '15/12/2025',
    pattern: '^\\d{2}/\\d{2}/\\d{4}$',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Reservation date must be a string' })
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'Reservation date must be in DD/MM/YYYY format (e.g., 15/12/2025)',
  })
  reservationDate?: string;

  @ApiProperty({
    description: 'Reservation time in HH:MM format (24-hour)',
    example: '19:30',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Reservation time must be a string' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Reservation time must be in HH:MM format (e.g., 19:30)',
  })
  reservationTime?: string;

  @ApiProperty({
    description: 'Number of guests',
    example: 4,
    minimum: 1,
    maximum: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Party size must be a number' })
  @Min(1, { message: 'Party size must be at least 1' })
  @Max(20, { message: 'Party size cannot exceed 20' })
  partySize?: number;

  @ApiProperty({
    description: 'Table ID to assign',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsMongoId({ message: 'Table ID must be a valid MongoDB ID' })
  tableId?: string;

  @ApiProperty({
    description: 'Reservation status',
    example: 'confirmed',
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  status?: string;
}

/**
 * DTO for reservations response
 * Separates output concerns from input validation
 */
export class ReservationResponseDto {
  id: string;
  customerName: string;
  customerEmail: string;
  reservationDate: string;
  reservationTime: string;
  endTime?: string; // End time of reservation (calculated)
  durationHours?: number; // Duration in hours
  partySize: number;
  tableId?: string;
  tableNumber?: string; // Table number for display
  userId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
