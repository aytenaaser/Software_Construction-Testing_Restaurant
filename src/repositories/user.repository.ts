/**
 * Concrete Implementation of User Repository
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles database operations
 * - Dependency Inversion: Implements repository interface
 * - Open/Closed: Can be extended without modifying the interface
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../models/user.schema';
import { IUserRepository } from '../services/interfaces/user-repository.interface';
import { CreateUserDto } from '../dto/user-dto';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: CreateUserDto & { password: string }): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  async findAll(excludePassword = true): Promise<UserDocument[]> {
    const query = this.userModel.find();
    if (excludePassword) {
      query.select('-password');
    }
    return query.exec();
  }

  async findById(id: string, excludePassword = true): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    const query = this.userModel.findById(id);
    if (excludePassword) {
      query.select('-password');
    }
    return query.exec();
  }

  async findByEmail(email: string, includePassword = false): Promise<UserDocument | null> {
    const query = this.userModel.findOne({ email: email.trim().toLowerCase() });
    if (includePassword) {
      query.select('+password');
    } else {
      query.select('-password');
    }
    return query.exec();
  }

  async update(id: string, data: Partial<UserDocument>): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Normalize email if provided
    if (data.email) {
      data.email = data.email.trim().toLowerCase();
    }

    return this.userModel
      .findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .select('-password')
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    const result = await this.userModel.findByIdAndDelete(id);
    return !!result;
  }

  async findByRole(roles: string[], excludePassword = true): Promise<UserDocument[]> {
    const query = this.userModel.find({ role: { $in: roles } });
    if (excludePassword) {
      query.select('-password');
    }
    return query.exec();
  }
}

