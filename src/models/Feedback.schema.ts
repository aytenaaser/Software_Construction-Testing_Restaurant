/**
 * Feedback Schema
 *
 * User Story: "As a customer, I want to leave feedback and ratings so the restaurant can improve"
 *
 * SOLID Principles:
 * - Single Responsibility: Manages customer feedback only
 * - Open/Closed: Can add new rating categories without breaking existing code
 *
 * Features:
 * - Overall rating + detailed ratings (food, service, ambience, value)
 * - Review text
 * - Images upload
 * - Admin response
 * - Moderation status
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

export enum FeedbackStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Reservation', required: true })
  reservationId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  // Overall Rating
  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  // Detailed Ratings
  @Prop({ min: 1, max: 5 })
  foodQuality: number;

  @Prop({ min: 1, max: 5 })
  serviceQuality: number;

  @Prop({ min: 1, max: 5 })
  ambience: number;

  @Prop({ min: 1, max: 5 })
  valueForMoney: number;

  // Review
  @Prop({ required: true, minlength: 10, maxlength: 1000 })
  review: string;

  @Prop()
  title: string;

  @Prop({ default: false })
  wouldRecommend: boolean;

  // Images
  @Prop({ type: [String], default: [] })
  images: string[];

  // Admin Response
  @Prop()
  adminResponse: string;

  @Prop()
  respondedBy: MongooseSchema.Types.ObjectId; // Admin user ID

  @Prop()
  respondedAt: Date;

  // Moderation
  @Prop({ enum: Object.values(FeedbackStatus), default: FeedbackStatus.PENDING })
  status: FeedbackStatus;

  @Prop()
  moderationNote: string;

  // Verification
  @Prop({ default: false })
  isVerified: boolean; // Customer actually dined

  // Helpfulness
  @Prop({ default: 0 })
  helpfulCount: number;

  @Prop({ default: false })
  isPublic: boolean;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

// Indexes
FeedbackSchema.index({ reservationId: 1 });
FeedbackSchema.index({ userId: 1 });
FeedbackSchema.index({ status: 1, isPublic: 1 });
FeedbackSchema.index({ rating: -1 });
FeedbackSchema.index({ createdAt: -1 });

