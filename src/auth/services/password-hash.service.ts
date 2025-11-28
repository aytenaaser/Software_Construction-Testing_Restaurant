/**
 * Password Hashing Service
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles password hashing and verification
 * - Open/Closed: Can be extended with different hashing algorithms
 */

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordHashService {
  private readonly SALT_ROUNDS = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

