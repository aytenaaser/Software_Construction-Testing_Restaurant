/**
 * MenuOrder Schema
 *
 * Represents pre-orders made by customers during reservation
 *
 * User Story: "As a customer, I want to pre-order my meal so that I can get faster service"
 *
 * SOLID Principles:
 * - Single Responsibility: Manages pre-order data only
 * - Open/Closed: Extensible for new order types
 *
 * Programming Paradigms:
 * - DECLARATIVE: Mongoose schema definition
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MenuOrderDocument = MenuOrder & Document;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  CANCELLED = 'cancelled',
}

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'MenuItem', required: true })
  menuItemId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  menuItemName: string; // Denormalized for performance

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number; // Price at time of order

  @Prop()
  specialInstructions: string;

  @Prop()
  allergyNote: string;
}

@Schema({ timestamps: true })
export class MenuOrder {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Reservation', required: true })
  reservationId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ enum: Object.values(OrderStatus), default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop()
  estimatedPreparationTime: number; // in minutes

  @Prop()
  specialRequests: string;

  @Prop()
  dietaryRestrictions: string;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop()
  confirmedAt: Date;

  @Prop()
  preparedAt: Date;

  @Prop()
  servedAt: Date;
}

export const MenuOrderSchema = SchemaFactory.createForClass(MenuOrder);

// Indexes
MenuOrderSchema.index({ reservationId: 1 });
MenuOrderSchema.index({ userId: 1 });
MenuOrderSchema.index({ status: 1 });
MenuOrderSchema.index({ createdAt: -1 });

