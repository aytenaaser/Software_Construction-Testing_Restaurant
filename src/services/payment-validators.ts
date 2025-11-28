/**
 * Payment Validation Strategies
 *
 * SOLID Principles:
 * - Single Responsibility: Each validator checks ONE rule
 * - Open/Closed: Easy to add new validators without modifying existing ones
 * - Interface Segregation: Single validate() method interface
 * - Liskov Substitution: All validators are interchangeable
 *
 * Programming Paradigms:
 * - IMPERATIVE: Step-by-step validation logic
 * - DECLARATIVE: Strategy pattern composition
 */

export type ValidatablePayment = {
  amount: number;
  method: string;
  reservationId: string;
  [key: string]: any;
};

/**
 * Strategy interface for payment validation
 * Follows Strategy Pattern - allows different validation strategies to be plugged in
 */
export interface PaymentValidationStrategy {
  validate(payment: ValidatablePayment): Promise<{ valid: boolean; errors: string[] }>;
}

/**
 * Validates payment amount constraint
 * IMPERATIVE: Explicit step-by-step validation logic
 */
export class PaymentAmountValidator implements PaymentValidationStrategy {
  private readonly MIN_AMOUNT = 0;
  private readonly MAX_AMOUNT = 100000; // $100,000 maximum

  validate(payment: ValidatablePayment): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (typeof payment.amount !== 'number') {
      errors.push('Payment amount must be a valid number');
    } else if (payment.amount < this.MIN_AMOUNT) {
      errors.push(`Payment amount must be at least $${this.MIN_AMOUNT}`);
    } else if (payment.amount > this.MAX_AMOUNT) {
      errors.push(`Payment amount cannot exceed $${this.MAX_AMOUNT}`);
    }

    return Promise.resolve({ valid: errors.length === 0, errors });
  }
}

/**
 * Validates payment method constraint
 * IMPERATIVE: Explicit validation for supported payment methods
 */
export class PaymentMethodValidator implements PaymentValidationStrategy {
  private readonly ALLOWED_METHODS = [
    'credit_card',
    'debit_card',
    'cash',
    'paypal',
    'bank_transfer',
  ];

  validate(payment: ValidatablePayment): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!payment.method) {
      errors.push('Payment method is required');
    } else if (!this.ALLOWED_METHODS.includes(payment.method)) {
      errors.push(
        `Invalid payment method. Allowed methods: ${this.ALLOWED_METHODS.join(', ')}`,
      );
    }

    return Promise.resolve({ valid: errors.length === 0, errors });
  }
}

/**
 * Validates reservation exists before payment
 * IMPERATIVE: Checks for required reservation reference
 */
export class ReservationReferenceValidator implements PaymentValidationStrategy {
  validate(payment: ValidatablePayment): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!payment.reservationId) {
      errors.push('Reservation ID is required for payment');
    } else if (typeof payment.reservationId !== 'string' || payment.reservationId.trim() === '') {
      errors.push('Invalid reservation ID format');
    }

    return Promise.resolve({ valid: errors.length === 0, errors });
  }
}

/**
 * Validates payment amount matches expected calculation
 * IMPERATIVE: Business logic validation
 */
export class PaymentCalculationValidator implements PaymentValidationStrategy {
  private readonly BASE_DEPOSIT_PERCENTAGE = 0.2; // 20% deposit
  private readonly PER_PERSON_AMOUNT = 50; // $50 per person

  validate(payment: ValidatablePayment): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // If partySize is provided, validate amount matches expected calculation
    if (payment.partySize && typeof payment.partySize === 'number') {
      const expectedMinimum = payment.partySize * this.PER_PERSON_AMOUNT * this.BASE_DEPOSIT_PERCENTAGE;

      if (payment.amount < expectedMinimum) {
        errors.push(
          `Payment amount should be at least $${expectedMinimum.toFixed(2)} (20% deposit for ${payment.partySize} people)`,
        );
      }
    }

    return Promise.resolve({ valid: errors.length === 0, errors });
  }
}

/**
 * Composite validator that runs multiple validation strategies
 * Follows Composite Pattern - combines multiple validators into one
 * DECLARATIVE: Composition of validators
 */
export class CompositePaymentValidator implements PaymentValidationStrategy {
  constructor(private readonly validators: PaymentValidationStrategy[]) {}

  validate(payment: ValidatablePayment): Promise<{ valid: boolean; errors: string[] }> {
    return Promise.all(this.validators.map((v) => v.validate(payment))).then((results) => {
      const allErrors = results.reduce((acc, r) => acc.concat(r.errors), [] as string[]);
      return { valid: allErrors.length === 0, errors: allErrors };
    });
  }
}

