/**
 * Payment Schema
 *
 * SOLID Principles:
 * - Single Responsibility: Defines payment data structure only
 * - Open/Closed: Can be extended with new fields without breaking existing code
 *
 * Data Model for:
 * - Payment tracking (amount, status, method)
 * - Reservation and customer references
 * - Payment history and audit trail
 * - Transaction details
 *
 * Programming Paradigms:
 * - DECLARATIVE: Uses Mongoose decorators and schema definition
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CASH = 'cash',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Reservation', required: true })
  reservationId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  customerId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ type: String, enum: Object.values(PaymentMethod), required: true })
  method: PaymentMethod;

  @Prop({ type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes for efficient querying
PaymentSchema.index({ reservationId: 1, status: 1 });
PaymentSchema.index({ customerId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

