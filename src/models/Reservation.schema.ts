/**
 * Reservation Schema
 *
 * SOLID Principles:
 * - Single Responsibility: Defines reservation data structure only
 * - Open/Closed: Can be extended with new fields without breaking existing code
 *
 * Data Model for:
 * - Customer information (name, email)
 * - Reservation details (date, time, party size)
 * - Table and user references
 * - Reservation status tracking
 * - Timestamps for audit trail
 *
 * Programming Paradigms:
 * - DECLARATIVE: Uses Mongoose decorators and schema definition
 *
 * Performance:
 * - Indexes on frequently queried fields for optimization
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ReservationDocument = Reservation & Document;

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Reservation {
  // MongoDB automatically creates _id, but you can reference it
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  customerName: string;

  @Prop({ required: true, lowercase: true, trim: true })
  customerEmail: string;

  @Prop({ required: true })
  reservationDate: string;

  @Prop({ required: true })
  reservationTime: string;

  @Prop({ default: 2 })
  durationHours: number; // Default 2 hours

  @Prop({ required: true })
  endTime: string; // Calculated end time (HH:MM format)

  @Prop({ required: true, min: 1, max: 20 })
  partySize: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Table', required: true })
  tableId: MongooseSchema.Types.ObjectId; // Now required - auto-assigned

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  // Menu Pre-order Support
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'MenuOrder' })
  menuOrderId?: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  hasPreOrder: boolean;

  @Prop({
    type: String,
    enum: Object.values(ReservationStatus),
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  // Reminder tracking
  @Prop({ default: false })
  reminderSent: boolean;

  @Prop({ type: Date })
  reminderSentAt?: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

// Add index for frequently queried fields
ReservationSchema.index({ userId: 1, reservationDate: -1 });
ReservationSchema.index({ reservationDate: 1, reservationTime: 1, tableId: 1 });
ReservationSchema.index({ status: 1, reservationDate: 1 });
