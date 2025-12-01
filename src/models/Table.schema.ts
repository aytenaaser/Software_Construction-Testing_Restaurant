// src/modules/tables/schemas/table.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TableDocument = Table & Document;

export enum TableStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  OCCUPIED = 'occupied',
  UNAVAILABLE = 'unavailable',
}

export enum TableLocation {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor',
  WINDOW_SIDE = 'window_side',
  PRIVATE_ROOM = 'private_room',
}

@Schema({ timestamps: true })
export class Table {
  @Prop({ required: true })
  capacity: number;

  @Prop({ default: true })
  isAvailable: boolean;

  // 2D Layout Support - User Story: "As a customer, I want to view table availability in real time"
  @Prop({ required: true, unique: true })
  tableNumber: string;

  @Prop({ required: true, enum: Object.values(TableLocation), default: TableLocation.INDOOR })
  location: TableLocation; // Location preference: indoor, outdoor, window side, private room

  @Prop({ default: 'Ground Floor' })
  floor: string; // 'Ground Floor', 'First Floor', etc.

  @Prop({ type: Object })
  position: { x: number; y: number };

  @Prop({ default: 'circle' })
  shape: string; // 'circle', 'square', 'rectangle'

  @Prop({ default: TableStatus.AVAILABLE })
  status: TableStatus;

  @Prop()
  description: string;

  @Prop({ default: false })
  isVIP: boolean;

  @Prop({ default: false })
  hasView: boolean; // Window view, outdoor, etc.

  @Prop({ type: [String], default: [] })
  features: string[]; // 'wheelchair_accessible', 'highchair_available', etc.
}

export const TableSchema = SchemaFactory.createForClass(Table);

// Indexes
TableSchema.index({ status: 1, isAvailable: 1 });
TableSchema.index({ floor: 1 });
TableSchema.index({ capacity: 1 });
