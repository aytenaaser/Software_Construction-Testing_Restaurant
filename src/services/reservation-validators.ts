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

    // No time constraints - any time is valid
    return Promise.resolve({ valid: true, errors: [] });
  }
}

/**
 * Validates reservation date constraint
 * NO CONSTRAINTS - accepts any date
 */
export class FutureDateValidator implements ReservationValidationStrategy {
  validate(reservation: ValidatableReservation): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const raw = (reservation as any).reservationDate;
    if (!raw || typeof raw !== 'string') {
      errors.push('Missing or invalid reservationDate');
      return Promise.resolve({ valid: errors.length === 0, errors });
    }

    // No date constraints - any date is valid
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
