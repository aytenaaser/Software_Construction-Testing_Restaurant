/**
 * ReservationPolicy Schema
 *
 * User Story: "As an administrator, I want to configure reservation policies"
 *
 * SOLID Principles:
 * - Single Responsibility: Manages reservation business rules
 * - Open/Closed: Can add new policies without breaking existing
 *
 * Configurable Settings:
 * - Booking window (advance days)
 * - Cancellation policy
 * - Deposit requirements
 * - Operating hours
 * - Blackout dates
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReservationPolicyDocument = ReservationPolicy & Document;

@Schema({ _id: false })
export class OperatingHours {
  @Prop({ required: true })
  open: string; // '11:00'

  @Prop({ required: true })
  close: string; // '23:00'

  @Prop({ default: true })
  isOpen: boolean;
}

@Schema({ _id: false })
export class TimeSlot {
  @Prop({ required: true })
  time: string; // '19:00'

  @Prop({ default: true })
  available: boolean;

  @Prop({ default: 0 })
  maxReservations: number; // 0 = unlimited
}

@Schema({ timestamps: true })
export class ReservationPolicy {
  // Only one policy document should exist (singleton pattern)
  @Prop({ default: 'default', unique: true })
  policyId: string;

  // Booking Window
  @Prop({ default: 1, min: 0 })
  minAdvanceBookingDays: number;

  @Prop({ default: 30, min: 1 })
  maxAdvanceBookingDays: number;

  // Cancellation Policy
  @Prop({ default: 24, min: 0 })
  cancellationHours: number; // Must cancel X hours before

  @Prop({ default: false })
  allowSameDayCancellation: boolean;

  @Prop({ default: 50, min: 0, max: 100 })
  cancellationPenaltyPercentage: number;

  // Deposit Settings
  @Prop({ default: false })
  requiresDeposit: boolean;

  @Prop({ default: 20, min: 0, max: 100 })
  depositPercentage: number;

  @Prop({ default: 0, min: 0 })
  depositFixedAmount: number;

  @Prop({ default: 6 })
  depositRequiredForPartySize: number; // Require deposit if party >= this

  // Party Size
  @Prop({ default: 1, min: 1 })
  minPartySize: number;

  @Prop({ default: 20, min: 1 })
  maxPartySize: number;

  // Reservation Duration
  @Prop({ default: 90, min: 30 })
  defaultReservationDuration: number; // minutes

  @Prop({ default: 120 })
  maxReservationDuration: number;

  // Operating Hours by Day
  @Prop({ type: OperatingHours })
  monday: OperatingHours;

  @Prop({ type: OperatingHours })
  tuesday: OperatingHours;

  @Prop({ type: OperatingHours })
  wednesday: OperatingHours;

  @Prop({ type: OperatingHours })
  thursday: OperatingHours;

  @Prop({ type: OperatingHours })
  friday: OperatingHours;

  @Prop({ type: OperatingHours })
  saturday: OperatingHours;

  @Prop({ type: OperatingHours })
  sunday: OperatingHours;

  // Time Slots
  @Prop({ type: [TimeSlot], default: [] })
  availableTimeSlots: TimeSlot[];

  // Blackout Dates (holidays, special events)
  @Prop({ type: [Date], default: [] })
  blackoutDates: Date[];

  @Prop({ type: [String], default: [] })
  blackoutReasons: string[];

  // Auto-confirmation
  @Prop({ default: false })
  autoConfirmReservations: boolean;

  @Prop({ default: 5 })
  autoConfirmIfAvailableWithin: number; // hours

  // Special Rules
  @Prop({ default: false })
  allowWalkIns: boolean;

  @Prop({ default: true })
  sendConfirmationEmail: boolean;

  @Prop({ default: true })
  sendReminderEmail: boolean;

  @Prop({ default: 24 })
  reminderHoursBefore: number;

  @Prop({ default: false })
  sendSmsNotifications: boolean;

  // Maximum reservations per customer
  @Prop({ default: 0 }) // 0 = unlimited
  maxReservationsPerCustomerPerDay: number;

  @Prop({ default: 0 })
  maxReservationsPerCustomerPerMonth: number;

  // Notes
  @Prop()
  policyDescription: string;

  @Prop()
  termsAndConditions: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ReservationPolicySchema = SchemaFactory.createForClass(ReservationPolicy);

// Ensure only one policy document
ReservationPolicySchema.index({ policyId: 1 }, { unique: true });

