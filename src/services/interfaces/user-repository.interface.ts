/**
 * Repository Interface for User
 *
 * SOLID Principles:
 * - Interface Segregation: Small, focused interface
 * - Dependency Inversion: Services depend on this abstraction
 * - Single Responsibility: Only handles data persistence
 */

import { UserDocument } from '../../models/user.schema';
import { CreateUserDto } from '../../dto/user-dto';

export interface IUserRepository {
  create(data: CreateUserDto & { password: string }): Promise<UserDocument>;
  findAll(excludePassword?: boolean): Promise<UserDocument[]>;
  findById(id: string, excludePassword?: boolean): Promise<UserDocument | null>;
  findByEmail(email: string, includePassword?: boolean): Promise<UserDocument | null>;
  update(id: string, data: Partial<UserDocument>): Promise<UserDocument | null>;
  delete(id: string): Promise<boolean>;
  findByRole(roles: string[], excludePassword?: boolean): Promise<UserDocument[]>;
}

