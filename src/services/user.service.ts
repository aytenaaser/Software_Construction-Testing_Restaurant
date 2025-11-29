/**
 * User Service
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles user business logic
 * - Open/Closed: Can be extended with new methods without modifying existing code
 * - Liskov Substitution: Uses UserDocument interface, can be replaced with any implementation
 * - Interface Segregation: Depends on minimal Model interface from Mongoose
 * - Dependency Inversion: Depends on Model abstraction, not concrete implementation
 *
 * Programming Paradigms:
 * - Imperative: Step-by-step create/update/delete operations with explicit control flow
 * - Declarative: Functional mapping and querying with .map() and MongoDB queries
 */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from '../models/user.schema';
import { CreateUserDto } from '../dto/user-dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * DECLARATIVE HELPER: Normalize email to lowercase
   * Pure function with no side effects
   */
  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * IMPERATIVE STYLE: Create a new user
   * Step-by-step operation with explicit error handling
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // Create user
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return user.save();
  }

  /**
   * IMPERATIVE STYLE: Update user internal data
   * Step-by-step validation and update
   */
  async updateUserInternal(
    userId: string,
    updateData: Partial<UserDocument>,
  ): Promise<UserDocument> {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    if (updateData.email) {
      updateData.email = this.normalizeEmail(updateData.email);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  /**
   * DECLARATIVE STYLE: Find user by email with password hash
   * Functional query composition
   */
  async findByEmailWithHash(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: this.normalizeEmail(email) })
      .select('+password')
      .exec();
  }

  /**
   * DECLARATIVE STYLE: Find all users
   * Functional approach using array methods and mapping
   */
  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().select('-password');
    return users.map((user) => user.toObject());
  }

  /**
   * IMPERATIVE STYLE: Find user by ID
   * Step-by-step with error handling
   */
  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * IMPERATIVE STYLE: Find user by email
   * Step-by-step with error handling
   */
  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * DECLARATIVE STYLE: Find user by email (optional)
   * Functional query composition returning null if not found
   */
  async findByEmailOptional(email: string): Promise<User | null> {
    return this.userModel
      .findOne({ email: this.normalizeEmail(email) })
      .select('-password')
      .lean()
      .exec();
  }

  /**
   * IMPERATIVE STYLE: Update user
   * Step-by-step with password hashing and validation
   */
  async update(id: string, updateUserDto: any): Promise<User> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If updating password, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: { ...updateUserDto } }, { new: true })
      .select('-password')
      .lean();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser as unknown as User;
  }

  /**
   * IMPERATIVE STYLE: Update user role
   * Step-by-step validation and role update
   */
  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: { role } }, { new: true })
      .select('-password')
      .lean();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser as unknown as User;
  }

  /**
   * IMPERATIVE STYLE: Delete user
   * Step-by-step validation and deletion
   */
  async delete(id: string): Promise<void> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userModel.findByIdAndDelete(id);
  }

  /**
   * DECLARATIVE STYLE: Get staff members
   * Functional filtering and mapping
   * Returns only STAFF role, not ADMIN
   */
  async getStaffMembers(): Promise<User[]> {
    const staff = await this.userModel
      .find({
        role: UserRole.STAFF,
      })
      .select('-password');

    return staff.map((user) => user.toObject());
  }

  /**
   * DECLARATIVE STYLE: Get customers
   * Functional filtering and mapping
   */
  async getCustomers(): Promise<User[]> {
    const customers = await this.userModel
      .find({
        role: UserRole.CUSTOMER,
      })
      .select('-password');

    return customers.map((user) => user.toObject());
  }
}
