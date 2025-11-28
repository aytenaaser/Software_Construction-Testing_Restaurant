/**
 * Payment Module
 *
 * SOLID Principles:
 * - Single Responsibility: Manages payment-related functionality only
 * - Open/Closed: Can be extended without modifying existing structure
 * - Dependency Inversion: Uses NestJS dependency injection
 *
 * Encapsulates all payment-related functionality:
 * - Payment creation and processing
 * - Payment status tracking
 * - Refund handling
 * - Payment statistics and reporting
 *
 * Follows Modular Architecture Principle:
 * - Independently testable
 * - Loosely coupled with other modules
 * - Clear boundaries and responsibilities
 *
 * Programming Paradigms:
 * - DECLARATIVE: Module configuration using decorators
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from '../models/payment.schema';
import { PaymentService } from '../services/payment.service';
import { PaymentController } from '../controllers/payment-controller';
import { PaymentMapperService } from '../services/mappers/payment-mapper.service';

import { AuthModule } from '../auth/auth-module';
import { PaymentRepository } from '../repositories/payment.repository';

@Module({
  imports: [
    AuthModule, // For authentication guards
    MongooseModule.forFeature([
      {
        name: Payment.name,
        schema: PaymentSchema,
      },
    ]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentMapperService,
    PaymentRepository,
  ],
  exports: [PaymentService, PaymentRepository], // Export for use in other modules
})
export class PaymentModule {}

