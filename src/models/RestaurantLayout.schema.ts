/**
 * Restaurant Layout Schema
 *
 * User Story: "As a customer, I want to view table availability in real time"
 * User Story: "As a staff member, I want to update table status"
 *
 * SOLID Principles:
 * - Single Responsibility: Manages restaurant floor plan data
 * - Open/Closed: Can add new floors/decorations without breaking existing
 *
 * Features:
 * - Multiple floor support
 * - Table positioning (x, y coordinates)
 * - Real-time table status tracking
 * - Visual elements (walls, decorations)
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type RestaurantLayoutDocument = RestaurantLayout & Document;

@Schema({ _id: false })
export class TablePosition {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Table', required: true })
  tableId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  tableNumber: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({ required: true, min: 0 })
  x: number; // X coordinate (pixels or percentage)

  @Prop({ required: true, min: 0 })
  y: number; // Y coordinate

  @Prop({ enum: ['circle', 'square', 'rectangle'], default: 'circle' })
  shape: string;

  @Prop({ default: 0 })
  rotation: number; // Degrees

  @Prop({ default: 60 })
  width: number;

  @Prop({ default: 60 })
  height: number;
}

@Schema({ _id: false })
export class Wall {
  @Prop({ required: true })
  x1: number;

  @Prop({ required: true })
  y1: number;

  @Prop({ required: true })
  x2: number;

  @Prop({ required: true })
  y2: number;

  @Prop({ default: '#333' })
  color: string;

  @Prop({ default: 2 })
  thickness: number;
}

@Schema({ _id: false })
export class Decoration {
  @Prop({ required: true })
  type: string; // 'plant', 'window', 'door', 'bar', 'stage', etc.

  @Prop({ required: true })
  x: number;

  @Prop({ required: true })
  y: number;

  @Prop()
  width: number;

  @Prop()
  height: number;

  @Prop()
  label: string;

  @Prop()
  icon: string; // SVG path or emoji
}

@Schema({ timestamps: true })
export class RestaurantLayout {
  @Prop({ required: true, unique: true })
  name: string; // 'Ground Floor', 'First Floor', 'Terrace', 'VIP Area'

  @Prop({ required: true, min: 0 })
  width: number; // Layout width in pixels

  @Prop({ required: true, min: 0 })
  height: number; // Layout height in pixels

  @Prop({ type: [TablePosition], default: [] })
  tables: TablePosition[];

  @Prop({ type: [Wall], default: [] })
  walls: Wall[];

  @Prop({ type: [Decoration], default: [] })
  decorations: Decoration[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  floorLevel: number; // 0 = ground, 1 = first, -1 = basement

  @Prop()
  backgroundImage: string;

  @Prop({ default: '#f5f5f5' })
  backgroundColor: string;

  @Prop({ default: 1.0 })
  scale: number; // Zoom level
}

export const RestaurantLayoutSchema = SchemaFactory.createForClass(RestaurantLayout);

// Indexes
RestaurantLayoutSchema.index({ name: 1 });
RestaurantLayoutSchema.index({ floorLevel: 1 });
RestaurantLayoutSchema.index({ isActive: 1 });

