/**
 * Payment DTOs (Data Transfer Objects)
 *
 * SOLID Principles:
 * - Single Responsibility: Only validates input/output data for payments
 * - Open/Closed: Can extend with new DTOs without modifying existing ones
 *
 * Programming Paradigms:
 * - DECLARATIVE: Uses class-validator decorators for validation rules
 */

import {
  IsString,
  IsNumber,
  IsEnum,
  IsMongoId,
  IsOptional,
  Min,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from '../models/payment.schema';

/**
 * DTO for creating a new payment
 * Follows Single Responsibility Principle - only validates input data
 */
export class CreatePaymentDto {
  @IsMongoId({ message: 'Reservation ID must be a valid MongoDB ID' })
  reservationId: string;

  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0, { message: 'Amount must be greater than or equal to 0' })
  amount: number;

  @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
  method: PaymentMethod;
}

/**
 * DTO for updating a payment
 * All fields are optional for partial updates
 */
export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'Invalid payment status' })
  status?: PaymentStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}

/**
 * DTO for payment response
 * Separates output concerns from input validation
 */
export class PaymentResponseDto {
  id: string;
  reservationId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  completedAt?: Date;
  createdAt: Date;
}

/**
 * DTO for payment statistics
 */
export class PaymentStatsDto {
  totalPayments: number;
  totalAmount: number;
  completedPayments: number;
  completedAmount: number;
  pendingPayments: number;
  pendingAmount: number;
  failedPayments: number;
}

