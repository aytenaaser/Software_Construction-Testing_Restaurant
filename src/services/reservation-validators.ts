import { ReservationDocument } from '../models/Reservation.schema';

/**
 * Type for validatable reservation data
 * Allows validation to work with DTOs, documents, or any object with these fields
 */
export type ValidatableReservation = {
  reservationDate: Date | string;
  reservationTime: string;
  partySize: number;
  [key: string]: any; // Allow additional properties
};

/**
 * Strategy interface for reservation validation
 * Follows Strategy Pattern - allows different validation strategies to be plugged in
 * Supports Open/Closed Principle - open for extension, closed for modification
 */
export interface ReservationValidationStrategy {
  validate(
    reservation: ValidatableReservation,
  ): Promise<{ valid: boolean; errors: string[] }>;
}

/**
 * Validates business hours constraint
 * Accepts HH:MM format (24-hour)
 * NO CONSTRAINTS - accepts any time
 */
export class BusinessHoursValidator implements ReservationValidationStrategy {
  validate(
    reservation: ValidatableReservation,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const timeValue = (reservation as any).reservationTime;
    if (typeof timeValue !== 'string') {
      errors.push('Missing or invalid reservationTime. Expected string');
      return Promise.resolve({ valid: errors.length === 0, errors });
    }

    // Validate HH:MM format (24-hour)
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timePattern.test(timeValue)) {
      errors.push('Reservation time must be in HH:MM format (e.g., 19:30)');
      return Promise.resolve({ valid: errors.length === 0, errors });
    }

    // No time constraints - any valid time is accepted
    return Promise.resolve({ valid: true, errors: [] });
  }
}

/**
 * Validates reservation date constraint
 * Accepts DD/MM/YYYY format
 * Ensures date is in the future (not past dates)
 */
export class FutureDateValidator implements ReservationValidationStrategy {
  validate(reservation: ValidatableReservation): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const raw = (reservation as any).reservationDate;
    if (!raw || typeof raw !== 'string') {
      errors.push('Missing or invalid reservationDate');
      return Promise.resolve({ valid: errors.length === 0, errors });
    }

    // Validate DD/MM/YYYY format
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!datePattern.test(raw)) {
      errors.push('Reservation date must be in DD/MM/YYYY format (e.g., 15/12/2025)');
      return Promise.resolve({ valid: errors.length === 0, errors });
    }

    // Parse DD/MM/YYYY to validate it's a real date
    const [day, month, year] = raw.split('/').map(Number);
    const reservationDate = new Date(year, month - 1, day);

    // Check if the parsed date is valid
    if (
      reservationDate.getDate() !== day ||
      reservationDate.getMonth() !== month - 1 ||
      reservationDate.getFullYear() !== year
    ) {
      errors.push('Invalid date. Please provide a valid date in DD/MM/YYYY format');
      return Promise.resolve({ valid: errors.length === 0, errors });
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    reservationDate.setHours(0, 0, 0, 0); // Reset time to start of day

    if (reservationDate < today) {
      errors.push('Reservation date cannot be in the past. Please choose a future date.');
      return Promise.resolve({ valid: errors.length === 0, errors });
    }

    // Date is valid and in the future
    return Promise.resolve({ valid: true, errors: [] });
  }
}

/**
 * Validates party size against restaurant capacity
 * Imperative approach - explicit capacity checking
 */
export class PartySizeValidator implements ReservationValidationStrategy {
  private readonly MAX_PARTY_SIZE = 20;
  private readonly MIN_PARTY_SIZE = 1;


  validate(reservation: ValidatableReservation): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const partySize = (reservation as any).partySize;
    if (typeof partySize !== 'number') {
      errors.push('Invalid or missing partySize');
      return Promise.resolve({ valid: errors.length === 0, errors });
    }

    if (partySize < this.MIN_PARTY_SIZE) {
      errors.push(`Party size must be at least ${this.MIN_PARTY_SIZE}`);
    } else if (partySize > this.MAX_PARTY_SIZE) {
      errors.push(`Party size cannot exceed ${this.MAX_PARTY_SIZE}`);
    }

    return Promise.resolve({ valid: errors.length === 0, errors });
  }
}

/**
 * Composite validator that runs multiple validation strategies
 * Follows Composite Pattern - combines multiple validators into one
 * Declarative approach - composition of validators
 */
export class CompositeReservationValidator implements ReservationValidationStrategy {
  constructor(private readonly validators: ReservationValidationStrategy[]) {}

  validate(reservation: ValidatableReservation): Promise<{ valid: boolean; errors: string[] }> {
    return Promise.all(this.validators.map((v) => v.validate(reservation))).then((results) => {
      const allErrors = results.reduce((acc, r) => acc.concat(r.errors), [] as string[]);
      return { valid: allErrors.length === 0, errors: allErrors };
    });
  }
}
