// src/modules/reservations/schemas/reservation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ReservationDocument = Reservation & Document;

@Schema()
export class Reservation {
  // MongoDB automatically creates _id, but you can reference it
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerEmail: string;

  @Prop({ required: true })
  reservationDate: Date;

  @Prop({ required: true })
  reservationTime: string;

  @Prop({ required: true })
  partySize: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Table', required: true })
  tableId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 'confirmed' })
  status: string;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
