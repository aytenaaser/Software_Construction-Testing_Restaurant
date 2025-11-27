// src/modules/users/users.service.ts
import {Injectable, NotFoundException, ConflictException, BadRequestException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import * as bcrypt from 'bcrypt';
import {User, UserDocument, UserRole} from "../models/user.schema";
import {CreateUserDto} from "../dto/user-dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}


    private normalizeEmail(email: string) {
        return email.trim().toLowerCase();
    }
    // Imperative style - step by step
    async create(createUserDto: CreateUserDto): Promise<User> {
        // Check if user already exists
        const existingUser = await this.userModel.findOne({
            email: createUserDto.email
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


    async updateUserInternal(userId: string, updateData: Partial<UserDocument>): Promise<UserDocument> {
        if (!userId || !Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('Invalid user ID');
        }
        if (updateData.email) {
            updateData.email = this.normalizeEmail(updateData.email);
        }

        const updatedUser = await this.userModel.findByIdAndUpdate(
            userId,
            {$set: updateData},
            {new: true, runValidators: true}
        ).exec();

        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }
        return updatedUser;
    }




    async findByEmailWithHash(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({email: this.normalizeEmail(email)}).select('+password').exec();
    }

    // Declarative style - using array methods
    async findAll(): Promise<User[]> {
        const users = await this.userModel.find().select('-password');
        return users.map(user => user.toObject());
    }

    async findById(id: string): Promise<User> {
        const user = await this.userModel.findById(id).select('-password');

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.userModel.findOne({ email });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async findByEmailOptional(email: string): Promise<User | null> {
        return this.userModel.findOne({ email: this.normalizeEmail(email) }).select('-password').lean().exec();
    }

    async update(id: string, updateUserDto: any): Promise<User> {
        const user = await this.userModel.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // If updating password, hash it
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
        }

        const updatedUser = await this.userModel.findByIdAndUpdate(
            id,
            { $set: { ...updateUserDto } },
            { new: true }
        ).select('-password').lean();

        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }

        return updatedUser as unknown as User;
    }

    async updateRole(id: string, role: UserRole): Promise<User> {
        const user = await this.userModel.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const updatedUser = await this.userModel.findByIdAndUpdate(
            id,
            { $set: { role } },
            { new: true }
        ).select('-password').lean();

        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }

        return updatedUser as unknown as User;

    }

    async delete(id: string): Promise<void> {
        const user = await this.userModel.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.userModel.findByIdAndDelete(id);
    }

    // Staff and Admin management
    async getStaffMembers(): Promise<User[]> {
        const staff = await this.userModel.find({
            role: { $in: [UserRole.STAFF, UserRole.ADMIN] }
        }).select('-password');

        return staff.map(user => user.toObject());
    }

    async getCustomers(): Promise<User[]> {
        const customers = await this.userModel.find({
            role: UserRole.CUSTOMER
        }).select('-password');

        return customers.map(user => user.toObject());
    }
}