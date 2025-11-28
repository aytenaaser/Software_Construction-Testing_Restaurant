/**
 * Payment Mapper Service
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles data transformation between domain and DTO
 * - Open/Closed: Can be extended with new mapping methods
 *
 * Programming Paradigms:
 * - DECLARATIVE: Pure transformation functions
 */

import { Injectable } from '@nestjs/common';
import { PaymentDocument } from '../../models/payment.schema';
import { PaymentResponseDto } from '../../dto/payment-dto';

@Injectable()
export class PaymentMapperService {
  /**
   * Maps Payment document to Response DTO
   * DECLARATIVE: Pure transformation function
   */
  toResponseDto(payment: PaymentDocument | any): PaymentResponseDto {
    return {
      id: payment._id?.toString() || payment.id,
      reservationId: payment.reservationId?.toString() || payment.reservationId,
      customerId: payment.customerId?.toString() || payment.customerId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      completedAt: payment.completedAt,
      createdAt: payment.createdAt || new Date(),
    };
  }

  /**
   * Maps multiple payments to DTOs
   * DECLARATIVE: Functional mapping
   */
  toResponseDtoList(payments: (PaymentDocument | any)[]): PaymentResponseDto[] {
    return payments.map(payment => this.toResponseDto(payment));
  }

  /**
   * Maps payment document to minimal DTO for lists
   * DECLARATIVE: Pure transformation with field selection
   */
  toListDto(payment: PaymentDocument | any) {
    return {
      id: payment._id?.toString() || payment.id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      createdAt: payment.createdAt,
    };
  }
}

