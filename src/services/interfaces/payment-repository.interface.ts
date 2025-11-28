/**
 * Payment Repository Interface
 *
 * SOLID Principles:
 * - Interface Segregation: Small, focused interface for payment operations
 * - Dependency Inversion: Services depend on this abstraction, not concrete implementations
 * - Single Responsibility: Only handles payment data persistence operations
 */

import { PaymentDocument } from '../../models/payment.schema';
import { CreatePaymentDto, UpdatePaymentDto } from '../../dto/payment-dto';

export interface IPaymentRepository {
  create(data: CreatePaymentDto & { customerId: string }): Promise<PaymentDocument>;
  findAll(): Promise<PaymentDocument[]>;
  findById(id: string): Promise<PaymentDocument | null>;
  findByReservationId(reservationId: string): Promise<PaymentDocument[]>;
  findByCustomerId(customerId: string): Promise<PaymentDocument[]>;
  findByStatus(status: string): Promise<PaymentDocument[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<PaymentDocument[]>;
  update(id: string, data: UpdatePaymentDto): Promise<PaymentDocument | null>;
  delete(id: string): Promise<boolean>;
  getStats(): Promise<any>;
}

