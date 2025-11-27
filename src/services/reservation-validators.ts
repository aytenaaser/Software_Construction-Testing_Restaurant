import { ReservationDocument } from '../models/Reservation.schema';

/**
 * Strategy interface for reservation validation
 * Follows Strategy Pattern - allows different validation strategies to be plugged in
 * Supports Open/Closed Principle - open for extension, closed for modification
 */
export interface ReservationValidationStrategy {
    validate(reservation: ReservationDocument | any): Promise<{ valid: boolean; errors: string[] }>;
}

/**
 * Validates business hours constraint
 * Imperative approach - explicit step-by-step validation logic
 */
export class BusinessHoursValidator implements ReservationValidationStrategy {
    private readonly BUSINESS_HOURS_START = 10; // 10:00 AM
    private readonly BUSINESS_HOURS_END = 22; // 10:00 PM

    async validate(reservation: ReservationDocument | any): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = [];

        // Extract hour from time string (HH:mm format)
        const [hourStr] = reservation.reservationTime.split(':');
        const hour = parseInt(hourStr, 10);

        // Imperative validation logic
        if (isNaN(hour)) {
            errors.push('Invalid time format. Expected HH:mm');
        } else if (hour < this.BUSINESS_HOURS_START || hour >= this.BUSINESS_HOURS_END) {
            errors.push(`Reservation time must be between ${this.BUSINESS_HOURS_START}:00 and ${this.BUSINESS_HOURS_END}:00`);
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }
}

/**
 * Validates reservation date constraint
 * Imperative approach - explicit validation for future dates
 */
export class FutureDateValidator implements ReservationValidationStrategy {
    private readonly MIN_ADVANCE_HOURS = 2; // Must book at least 2 hours in advance

    async validate(reservation: ReservationDocument | any): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = [];

        const now = new Date();
        const reservationDatetime = new Date(reservation.reservationDate);

        // Check if reservation date is in the future
        const timeDiffHours = (reservationDatetime.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (timeDiffHours < this.MIN_ADVANCE_HOURS) {
            errors.push(`Reservation must be made at least ${this.MIN_ADVANCE_HOURS} hours in advance`);
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }
}

/**
 * Validates party size against restaurant capacity
 * Imperative approach - explicit capacity checking
 */
export class PartySizeValidator implements ReservationValidationStrategy {
    private readonly MAX_PARTY_SIZE = 20;
    private readonly MIN_PARTY_SIZE = 1;

    async validate(reservation: ReservationDocument | any): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = [];

        if (reservation.partySize < this.MIN_PARTY_SIZE) {
            errors.push(`Party size must be at least ${this.MIN_PARTY_SIZE}`);
        } else if (reservation.partySize > this.MAX_PARTY_SIZE) {
            errors.push(`Party size cannot exceed ${this.MAX_PARTY_SIZE}`);
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }
}

/**
 * Composite validator that runs multiple validation strategies
 * Follows Composite Pattern - combines multiple validators into one
 * Declarative approach - composition of validators
 */
export class CompositeReservationValidator implements ReservationValidationStrategy {
    constructor(private readonly validators: ReservationValidationStrategy[]) {}

    async validate(reservation: ReservationDocument | any): Promise<{ valid: boolean; errors: string[] }> {
        // Declarative approach - using Promise.all and map
        const results = await Promise.all(
            this.validators.map(validator => validator.validate(reservation))
        );

        // Combine all errors
        const allErrors = results.reduce((acc, result) => [...acc, ...result.errors], [] as string[]);

        return {
            valid: allErrors.length === 0,
            errors: allErrors,
        };
    }
}

