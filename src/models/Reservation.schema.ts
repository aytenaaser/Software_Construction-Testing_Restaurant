// src/modules/reservations/schemas/reservation.schema.ts
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
  reservationDate: Date;

  @Prop({ required: true, match: /^\d{2}:\d{2}$/ })
  reservationTime: string;

  @Prop({ required: true, min: 1, max: 20 })
  partySize: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Table', required: true })
  tableId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(ReservationStatus),
    default: ReservationStatus.CONFIRMED
  })
  status: ReservationStatus;

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

