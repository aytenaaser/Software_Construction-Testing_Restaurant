/**
 * MenuItem Schema
 *
 * SOLID Principles:
 * - Single Responsibility: Defines menu item data structure only
 * - Open/Closed: Can be extended with new fields without breaking existing code
 *
 * Data Model for:
 * - Menu item details (name, description, price)
 * - Category and availability
 * - Allergen information
 * - Preparation time
 * - Images and tags
 *
 * Programming Paradigms:
 * - DECLARATIVE: Uses Mongoose decorators
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MenuItemDocument = MenuItem & Document;

export enum MenuCategory {
  APPETIZER = 'appetizer',
  MAIN_COURSE = 'main',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
  SPECIAL = 'special',
}

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: Object.values(MenuCategory) })
  category: MenuCategory;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop()
  image: string;

  @Prop({ default: true })
  available: boolean;

  @Prop({ min: 0 })
  preparationTime: number; // in minutes

  @Prop({ type: [String], default: [] })
  allergens: string[];

  @Prop({ type: [String], default: [] })
  tags: string[]; // vegetarian, vegan, spicy, popular, etc.

  @Prop({ default: 0 })
  calories: number;

  @Prop({ default: false })
  isSpecialOffer: boolean;

  @Prop()
  originalPrice: number; // for special offers

  @Prop({ default: 0 })
  orderCount: number; // Track popularity

  @Prop({ default: 5.0 })
  rating: number; // Average rating from feedback
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);

// Indexes for performance
MenuItemSchema.index({ category: 1, available: 1 });
MenuItemSchema.index({ name: 'text', description: 'text' });
MenuItemSchema.index({ orderCount: -1 }); // For popular items

