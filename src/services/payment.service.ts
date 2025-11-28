/**
 * Payment Service
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles payment business logic orchestration
 * - Open/Closed: Strategy pattern for validators, easy to extend
 * - Liskov Substitution: Uses PaymentDocument interface
 * - Interface Segregation: Focused validator and mapper interfaces
 * - Dependency Inversion: Depends on repository and validator abstractions
 *
 * Programming Paradigms:
 * - IMPERATIVE: Step-by-step payment operations (create, process, complete)
 * - DECLARATIVE: Functional queries and transformations
 *
 * Business Logic:
 * - Payment creation with validation
 * - Payment processing and completion
 * - Payment status tracking
 * - Statistics and reporting
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from '../models/payment.schema';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentResponseDto,
  PaymentStatsDto,
} from '../dto/payment-dto';
import { PaymentMapperService } from './mappers/payment-mapper.service';
import {
  PaymentValidationStrategy,
  CompositePaymentValidator,
  PaymentAmountValidator,
  PaymentMethodValidator,
  ReservationReferenceValidator,
  PaymentCalculationValidator,
} from './payment-validators';

@Injectable()
export class PaymentService {
  private readonly validator: PaymentValidationStrategy;

  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
    private readonly mapper: PaymentMapperService,
  ) {
    // Strategy pattern: Compose validators using dependency injection
    // This follows the Open/Closed Principle - easy to add more validators
    this.validator = new CompositePaymentValidator([
      new PaymentAmountValidator(),
      new PaymentMethodValidator(),
      new ReservationReferenceValidator(),
      new PaymentCalculationValidator(),
    ]);
  }

  /**
   * IMPERATIVE STYLE: Create a new payment
   * Step-by-step validation, creation, and response mapping
   */
  async create(
    createPaymentDto: CreatePaymentDto,
    customerId: string,
  ): Promise<PaymentResponseDto> {
    // Step 1: Validate input
    const validationResult = await this.validator.validate(createPaymentDto as any);
    if (!validationResult.valid) {
      throw new BadRequestException({
        message: 'Payment validation failed',
        errors: validationResult.errors,
      });
    }

    // Step 2: Check for existing pending payments for this reservation
    const existingPayment = await this.paymentModel.findOne({
      reservationId: new Types.ObjectId(createPaymentDto.reservationId),
      status: PaymentStatus.PENDING,
    });

    if (existingPayment) {
      throw new ConflictException(
        'A pending payment already exists for this reservation',
      );
    }

    // Step 3: Create payment
    const payment = new this.paymentModel({
      ...createPaymentDto,
      customerId: new Types.ObjectId(customerId),
      reservationId: new Types.ObjectId(createPaymentDto.reservationId),
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
    });

    const savedPayment = await payment.save();

    // Step 4: Return mapped response
    return this.mapper.toResponseDto(savedPayment);
  }

  /**
   * DECLARATIVE STYLE: Find all payments
   * Functional approach with filtering and mapping
   */
  async findAll(): Promise<PaymentResponseDto[]> {
    return this.paymentModel
      .find()
      .sort({ createdAt: -1 })
      .populate('reservationId', 'customerName reservationDate reservationTime')
      .populate('customerId', 'name email')
      .lean()
      .exec()
      .then((payments: any[]) =>
        payments.map(payment => this.mapper.toResponseDto(payment))
      );
  }

  /**
   * IMPERATIVE STYLE: Find payment by ID
   * Step-by-step with explicit error handling
   */
  async findById(id: string): Promise<PaymentResponseDto> {
    // Validate ID format
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID format');
    }

    // Query database
    const payment = await this.paymentModel
      .findById(id)
      .populate('reservationId', 'customerName reservationDate reservationTime partySize')
      .populate('customerId', 'name email phone')
      .lean()
      .exec() as any;

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return this.mapper.toResponseDto(payment);
  }

  /**
   * DECLARATIVE STYLE: Find payments by reservation ID
   * Functional query with mapping
   */
  async findByReservationId(reservationId: string): Promise<PaymentResponseDto[]> {
    if (!Types.ObjectId.isValid(reservationId)) {
      throw new BadRequestException('Invalid reservation ID');
    }

    return this.paymentModel
      .find({ reservationId: new Types.ObjectId(reservationId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec()
      .then((payments: any[]) =>
        payments.map(payment => this.mapper.toResponseDto(payment))
      );
  }

  /**
   * DECLARATIVE STYLE: Find payments by customer ID
   * Functional filtering with population
   */
  async findByCustomerId(customerId: string): Promise<PaymentResponseDto[]> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    return this.paymentModel
      .find({ customerId: new Types.ObjectId(customerId) })
      .sort({ createdAt: -1 })
      .populate('reservationId', 'customerName reservationDate reservationTime')
      .lean()
      .exec()
      .then((payments: any[]) =>
        payments.map(payment => this.mapper.toResponseDto(payment))
      );
  }

  /**
   * DECLARATIVE STYLE: Find payments by status
   * Functional filtering
   */
  async findByStatus(status: PaymentStatus): Promise<PaymentResponseDto[]> {
    return this.paymentModel
      .find({ status })
      .sort({ createdAt: -1 })
      .populate('reservationId', 'customerName reservationDate')
      .populate('customerId', 'name email')
      .lean()
      .exec()
      .then((payments: any[]) =>
        payments.map(payment => this.mapper.toResponseDto(payment))
      );
  }

  /**
   * DECLARATIVE STYLE: Find payments by date range
   * Functional filtering with date range query
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<PaymentResponseDto[]> {
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
      .exec()
      .then((payments: any[]) =>
        payments.map(payment => this.mapper.toResponseDto(payment))
      );
  }

  /**
   * IMPERATIVE STYLE: Complete a payment
   * Step-by-step completion with validation
   */
  async completePayment(id: string): Promise<PaymentResponseDto> {
    // Step 1: Validate ID
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }

    // Step 2: Find payment
    const payment = await this.paymentModel.findById(id);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Step 3: Validate current status
    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment is already completed');
    }

    if (payment.status === PaymentStatus.FAILED) {
      throw new BadRequestException('Cannot complete a failed payment');
    }

    // Step 4: Update payment
    payment.status = PaymentStatus.COMPLETED;
    payment.completedAt = new Date();

    const updatedPayment = await payment.save();

    return this.mapper.toResponseDto(updatedPayment);
  }

  /**
   * IMPERATIVE STYLE: Mark payment as failed
   * Step-by-step status update with validation
   */
  async failPayment(id: string): Promise<PaymentResponseDto> {
    // Step 1: Validate ID
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }

    // Step 2: Find payment
    const payment = await this.paymentModel.findById(id);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Step 3: Validate current status
    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Cannot fail a completed payment');
    }

    if (payment.status === PaymentStatus.FAILED) {
      throw new BadRequestException('Payment is already marked as failed');
    }

    // Step 4: Update status
    payment.status = PaymentStatus.FAILED;
    const updatedPayment = await payment.save();

    return this.mapper.toResponseDto(updatedPayment);
  }

  /**
   * IMPERATIVE STYLE: Update payment
   * Step-by-step update with validation
   */
  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<PaymentResponseDto> {
    // Step 1: Validate ID
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }

    // Step 2: Find existing payment
    const existingPayment = await this.paymentModel.findById(id);

    if (!existingPayment) {
      throw new NotFoundException('Payment not found');
    }

    // Step 3: Prepare update data
    const updateData: any = { ...updatePaymentDto };

    // Auto-set completion timestamp if status changes to completed
    if (updatePaymentDto.status === PaymentStatus.COMPLETED && !existingPayment.completedAt) {
      updateData.completedAt = new Date();
    }

    // Step 4: Update payment
    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .lean()
      .exec() as any;

    if (!updatedPayment) {
      throw new NotFoundException('Payment not found');
    }

    return this.mapper.toResponseDto(updatedPayment);
  }

  /**
   * IMPERATIVE STYLE: Delete payment
   * Step-by-step validation and deletion
   */
  async delete(id: string): Promise<{ message: string }> {
    // Step 1: Validate ID
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }

    // Step 2: Find payment
    const payment = await this.paymentModel.findById(id);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Step 3: Validate payment can be deleted
    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Completed payments cannot be deleted');
    }

    // Step 4: Delete payment
    await this.paymentModel.findByIdAndDelete(id);

    return { message: 'Payment deleted successfully' };
  }

  /**
   * DECLARATIVE STYLE: Get payment statistics
   * Functional aggregation with transformation
   */
  async getStatistics(): Promise<PaymentStatsDto> {
    const stats = await this.paymentModel.aggregate([
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                totalPayments: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
              },
            },
          ],
          completed: [
            {
              $match: { status: PaymentStatus.COMPLETED },
            },
            {
              $group: {
                _id: null,
                completedPayments: { $sum: 1 },
                completedAmount: { $sum: '$amount' },
              },
            },
          ],
          pending: [
            {
              $match: { status: PaymentStatus.PENDING },
            },
            {
              $group: {
                _id: null,
                pendingPayments: { $sum: 1 },
                pendingAmount: { $sum: '$amount' },
              },
            },
          ],
          failed: [
            {
              $match: { status: PaymentStatus.FAILED },
            },
            {
              $group: {
                _id: null,
                failedPayments: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const result = stats[0];

    return {
      totalPayments: result.overall[0]?.totalPayments || 0,
      totalAmount: result.overall[0]?.totalAmount || 0,
      completedPayments: result.completed[0]?.completedPayments || 0,
      completedAmount: result.completed[0]?.completedAmount || 0,
      pendingPayments: result.pending[0]?.pendingPayments || 0,
      pendingAmount: result.pending[0]?.pendingAmount || 0,
      failedPayments: result.failed[0]?.failedPayments || 0,
    };
  }
}

