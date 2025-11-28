/**
 * OTP (One-Time Password) Service
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles OTP generation and validation logic
 * - Open/Closed: Can be extended with different OTP algorithms
 */

import { Injectable } from '@nestjs/common';

export interface OTPData {
  code: string;
  expiresAt: Date;
}

@Injectable()
export class OTPService {
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 10;

  /**
   * Generate a new OTP code and expiry time
   * DECLARATIVE: Pure function with no side effects
   */
  generate(): OTPData {
    const code = Math.floor(
      Math.pow(10, this.OTP_LENGTH - 1) +
      Math.random() * (Math.pow(10, this.OTP_LENGTH) - Math.pow(10, this.OTP_LENGTH - 1))
    ).toString();

    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    return { code, expiresAt };
  }

  /**
   * Validate OTP code and expiry
   * DECLARATIVE: Pure function
   */
  isValid(storedCode: string | null, storedExpiry: Date | null, inputCode: string): boolean {
    if (!storedCode || !storedExpiry) {
      return false;
    }

    const now = new Date();
    return storedCode === inputCode && now < storedExpiry;
  }

  /**
   * Check if enough time has passed for rate limiting
   * DECLARATIVE: Pure function
   */
  canResend(lastExpiry: Date | null, cooldownMinutes: number = 2): boolean {
    if (!lastExpiry) {
      return true;
    }

    const now = Date.now();
    const timeSinceLastSend = now - lastExpiry.getTime();
    return timeSinceLastSend >= cooldownMinutes * 60 * 1000;
  }
}

