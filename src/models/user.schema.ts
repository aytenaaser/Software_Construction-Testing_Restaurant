/**
 * User Schema
 *
 * SOLID Principles:
 * - Single Responsibility: Defines user data structure only
 * - Open/Closed: Can be extended with new fields without breaking existing code
 *
 * Data Model for:
 * - User authentication (email, password)
 * - User roles (customer, staff, admin)
 * - Email verification (OTP codes and expiry)
 * - Password reset (OTP codes and expiry)
 * - User relationships (reservations)
 *
 * Programming Paradigms:
 * - DECLARATIVE: Uses Mongoose decorators to define schema
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  CUSTOMER = 'customer',
  STAFF = 'staff',
  ADMIN = 'admin',
}

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Prop()
  phone: string;

  @Prop({ default: false })
  isEmailVerified?: boolean;

  @Prop({ type: String, default: null })
  otpCode?: string | null;

  @Prop({ type: Date, default: null })
  otpExpiresAt?: Date | null;

  @Prop({ type: String, default: null })
  passwordResetOtpCode?: string | null;

  @Prop({ type: Date, default: null })
  passwordResetOtpExpiresAt?: Date | null;

  // Use Types.ObjectId instead of MongooseSchema.Types.ObjectId
  @Prop([{ type: Types.ObjectId, ref: 'Reservation' }])
  reservationIds: Types.ObjectId[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
