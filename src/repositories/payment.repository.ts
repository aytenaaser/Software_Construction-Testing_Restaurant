/**
 * Payment Repository
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles payment database operations
 * - Dependency Inversion: Implements IPaymentRepository interface
 * - Open/Closed: Can be extended without modifying the interface
 *
 * Programming Paradigms:
 * - IMPERATIVE: Step-by-step database operations
 * - DECLARATIVE: MongoDB query composition
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from '../models/payment.schema';
import { IPaymentRepository } from '../services/interfaces/payment-repository.interface';
import { CreatePaymentDto, UpdatePaymentDto } from '../dto/payment-dto';


@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  /**
   * IMPERATIVE STYLE: Create new payment
   * Step-by-step payment creation
   */
  async create(data: CreatePaymentDto & { customerId: string }): Promise<PaymentDocument> {
    const payment = new this.paymentModel({
      ...data,
      customerId: new Types.ObjectId(data.customerId),
      reservationId: new Types.ObjectId(data.reservationId),
      status: PaymentStatus.PENDING,
    });
    return payment.save();
  }

  /**
   * DECLARATIVE STYLE: Find all payments
   * Functional query composition
   */
  async findAll(): Promise<PaymentDocument[]> {
    return this.paymentModel
      .find()
      .sort({ createdAt: -1 })
      .populate('reservationId', 'customerName reservationDate reservationTime')
      .populate('customerId', 'name email')
      .lean()
      .exec() as any;
  }

  /**
   * IMPERATIVE STYLE: Find payment by ID
   * Step-by-step with validation
   */
  async findById(id: string): Promise<PaymentDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }
    return this.paymentModel
      .findById(id)
      .populate('reservationId', 'customerName reservationDate reservationTime')
      .populate('customerId', 'name email')
      .lean()
      .exec() as any;
  }

  /**
   * DECLARATIVE STYLE: Find payments by reservation ID
   * Functional filtering
   */
  async findByReservationId(reservationId: string): Promise<PaymentDocument[]> {
    if (!Types.ObjectId.isValid(reservationId)) {
      throw new BadRequestException('Invalid reservation ID');
    }
    return this.paymentModel
      .find({ reservationId: new Types.ObjectId(reservationId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec() as any;
  }

  /**
   * DECLARATIVE STYLE: Find payments by customer ID
   * Functional filtering with sorting
   */
  async findByCustomerId(customerId: string): Promise<PaymentDocument[]> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('Invalid customer ID');
    }
    return this.paymentModel
      .find({ customerId: new Types.ObjectId(customerId) })
      .sort({ createdAt: -1 })
      .populate('reservationId', 'customerName reservationDate reservationTime')
      .lean()
      .exec() as any;
  }

  /**
   * DECLARATIVE STYLE: Find payments by status
   * Functional filtering
   */
  async findByStatus(status: string): Promise<PaymentDocument[]> {
    return this.paymentModel
      .find({ status })
      .sort({ createdAt: -1 })
      .populate('reservationId', 'customerName reservationDate')
      .populate('customerId', 'name email')
      .lean()
      .exec() as any;
  }

  /**
   * DECLARATIVE STYLE: Find payments by date range
   * Functional filtering with date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<PaymentDocument[]> {
    return this.paymentModel
      .find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ createdAt: -1 })
      .populate('reservationId', 'customerName reservationDate')
      .populate('customerId', 'name email')
      .lean()
      .exec() as any;
  }

  /**
   * IMPERATIVE STYLE: Update payment
   * Step-by-step update with validation
   */
  async update(id: string, data: UpdatePaymentDto): Promise<PaymentDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }

    const updateData: any = { ...data };

    // Set completion timestamp if status is completed
    if (data.status === PaymentStatus.COMPLETED && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }


    return this.paymentModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .lean()
      .exec() as any;
  }

  /**
   * IMPERATIVE STYLE: Delete payment
   * Step-by-step validation and deletion
   */
  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }
    const result = await this.paymentModel.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * DECLARATIVE STYLE: Get payment statistics
   * Functional aggregation pipeline
   */
  async getStats(): Promise<any> {
    const stats = await this.paymentModel.aggregate([
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalPayments: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
              },
            },
          ],
          statusStats: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                amount: { $sum: '$amount' },
              },
            },
          ],
          methodStats: [
            {
              $group: {
                _id: '$method',
                count: { $sum: 1 },
                amount: { $sum: '$amount' },
              },
            },
          ],
        },
      },
    ]);

    return stats[0];
  }
}

