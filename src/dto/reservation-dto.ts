import {
  IsString,
  IsEmail,
  IsDate,
  IsNumber,
  IsMongoId,
  IsOptional,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new reservation
 * Follows Single Responsibility Principle - only validates input data
 */
export class CreateReservationDto {
  @IsString({ message: 'Customer name must be a string' })
  customerName: string;

  @IsEmail({}, { message: 'Invalid email format' })
  customerEmail: string;

  @IsString({ message: 'Reservation date must be a string' })
  reservationDate: string;

  @IsString({ message: 'Reservation time must be a string' })
  reservationTime: string;

  @IsNumber({}, { message: 'Party size must be a number' })
  @Min(1, { message: 'Party size must be at least 1' })
  @Max(20, { message: 'Party size cannot exceed 20' })
  partySize: number;

  // @IsMongoId({ message: 'Table ID must be a valid MongoDB ID' })
  // tableId: string;
}

/**
 * DTO for updating a reservation
 * All fields are optional for partial updates
 */
export class UpdateReservationDto {
  @IsOptional()
  @IsString({ message: 'Customer name must be a string' })
  customerName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  customerEmail?: string;

  @IsOptional()
  @IsString({ message: 'Reservation date must be a string' })
  reservationDate?: string;

  @IsOptional()
  @IsString({ message: 'Reservation time must be a string' })
  reservationTime?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Party size must be a number' })
  @Min(1, { message: 'Party size must be at least 1' })
  @Max(20, { message: 'Party size cannot exceed 20' })
  partySize?: number;

  @IsOptional()
  @IsMongoId({ message: 'Table ID must be a valid MongoDB ID' })
  tableId?: string;

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
  partySize: number;
  tableId?: string;
  userId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
