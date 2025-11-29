import { Injectable, BadRequestException, NotFoundException, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation, ReservationDocument } from '../models/Reservation.schema';
import { Table, TableDocument } from '../models/Table.schema';
import { CreateReservationDto, UpdateReservationDto, ReservationResponseDto } from '../dto/reservation-dto';
import { ReservationMapperService } from './mappers/reservation-mapper.service';
import { ReservationValidationStrategy, CompositeReservationValidator, BusinessHoursValidator, FutureDateValidator, PartySizeValidator } from './reservation-validators';
import { UsersService } from './user.service';
import { UserRole } from '../models/user.schema';

/**
 * Reservation Service
 *
 * - Single Responsibility: Only handles reservation business logic orchestration
 * - Liskov Substitution: Uses interface-based validators and repositories
 * - Interface Segregation: Small, focused interfaces (validators, repositories, mappers)
 * - Dependency Inversion: Depends on abstractions (validators), not concrete implementations
 *
 * - Validation logic delegated to validator strategies
 * - Data mapping delegated to mapper service
 * - Database operations isolated
 *
 * Programming Paradigms:
 * - Imperative: Step-by-step create/update/delete operations
 * - Declarative: Functional mapping and Promise chains
 *
 * Security Features:
 * - Uses authenticated user's email (no spoofing)
 * - Role-based access control
 * - Pending approval workflow
 * - Table availability checking
 */
@Injectable()
export class ReservationService {
  private readonly validator: ReservationValidationStrategy;

  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    @InjectModel(Table.name)
    private tableModel: Model<TableDocument>,
    private readonly mapper: ReservationMapperService,
    private readonly usersService: UsersService,
  ) {
    // Strategy pattern: Compose validators using dependency injection
    // This follows the Open/Closed Principle - easy to add more validators
    this.validator = new CompositeReservationValidator([
      new BusinessHoursValidator(),
      new FutureDateValidator(),
      new PartySizeValidator(),
    ]);
  }

    /**
   * IMPERATIVE STYLE: Create a new reservation
   * Step-by-step validation, conflict checking, and creation
   * Security: Uses authenticated user's email from database
   */
  async create(createReservationDto: CreateReservationDto, userId: string): Promise<ReservationResponseDto> {
    // Step 1: Fetch authenticated user to get their email
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Step 2: Create reservation data with user's email
    const reservationData = {
      ...createReservationDto,
      customerEmail: user.email, // Use authenticated user's email
    };

    // Step 3: Validate input
    const validationResult = await this.validator.validate(reservationData);
    if (!validationResult.valid) {
      throw new BadRequestException({
        message: 'Reservation validation failed',
        errors: validationResult.errors,
      });
    }

    // Step 4: Check for duplicate reservation (same user, same date/time)
    const existingReservation = await this.reservationModel.findOne({
      userId: new Types.ObjectId(userId),
      reservationDate: createReservationDto.reservationDate,
      reservationTime: createReservationDto.reservationTime,
      status: { $in: ['confirmed', 'pending'] },
    });

    if (existingReservation) {
      throw new ConflictException('You already have a reservation for this date and time');
    }

    // Step 5: Create reservation document with PENDING status
    const reservation = new this.reservationModel({
      customerName: createReservationDto.customerName,
      customerEmail: user.email, // Use user's email from database
      reservationDate: createReservationDto.reservationDate,
      reservationTime: createReservationDto.reservationTime,
      partySize: createReservationDto.partySize,
      userId: new Types.ObjectId(userId),
      status: 'pending', // Default to pending - awaiting admin approval
    });

    // Step 6: Save to database
    const savedReservation = await reservation.save();

    // Step 7: Map to response DTO and return
    return this.mapToResponseDto(savedReservation);
  }

    /**
     * DECLARATIVE STYLE: Find all reservations
     * Uses functional approach with filtering and mapping
     */
    async findAll(): Promise<ReservationResponseDto[]> {
        return this.reservationModel
            .find()
            .sort({ reservationDate: -1, reservationTime: 1 })
            .lean()
            .exec()
            .then((reservations: any[]) =>
                // Declarative mapping - transforms each reservation to DTO
                reservations.map(res => this.mapToResponseDto(res))
            );
    }

    /**
     * DECLARATIVE STYLE: Find reservations by date range
     * Functional approach with filtering
     * Fixed: Compares date strings properly
     */
    async findByDateRange(startDate: Date, endDate: Date): Promise<ReservationResponseDto[]> {
        // Convert dates to YYYY-MM-DD format for string comparison
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        return this.reservationModel
            .find({
                reservationDate: {
                    $gte: startDateStr,
                    $lte: endDateStr,
                },
            })
            .sort({ reservationDate: 1, reservationTime: 1 })
            .lean()
            .exec()
            .then((reservations: any[]) =>
                reservations.map(res => this.mapToResponseDto(res))
            );
    }


    /**
     * IMPERATIVE STYLE: Find a single reservation by ID
     * Step-by-step with explicit error handling
     */
    async findById(id: string): Promise<ReservationResponseDto> {
        // Validate ID format
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid reservation ID');
        }

        // Query database
        const reservation = await this.reservationModel.findById(id).lean().exec() as any;

        // Check if exists
        if (!reservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        // Map and return
        return this.mapToResponseDto(reservation);
    }

    /**
     * IMPERATIVE STYLE: Update a reservation
     * Step-by-step logic with validation, authorization, and availability checking
     */
    async update(id: string, updateReservationDto: UpdateReservationDto, userId: string, userRole: UserRole): Promise<ReservationResponseDto> {
        // Step 1: Validate ID
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid reservation ID');
        }

        // Step 2: Find existing reservation
        const existingReservation = await this.reservationModel.findById(id);
        if (!existingReservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        // Step 3: Check authorization (only owner or admin can update)
        if (userRole !== UserRole.ADMIN && existingReservation.userId.toString() !== userId) {
            throw new ForbiddenException('You can only update your own reservations');
        }

        // Step 4: If updating date/time, check availability
        if (updateReservationDto.reservationDate || updateReservationDto.reservationTime) {
            const newDate = updateReservationDto.reservationDate || existingReservation.reservationDate;
            const newTime = updateReservationDto.reservationTime || existingReservation.reservationTime;

            // Check for conflicts (excluding current reservation)
            const conflict = await this.reservationModel.findOne({
                _id: { $ne: id },
                reservationDate: newDate,
                reservationTime: newTime,
                status: { $in: ['confirmed', 'pending'] },
            });

            if (conflict) {
                throw new ConflictException('Time slot not available');
            }
        }

        // Step 5: Prepare update object
        const updateData = { ...updateReservationDto };
        if (updateData.tableId) {
            updateData.tableId = new Types.ObjectId(updateData.tableId) as any;
        }

        // Step 6: Validate updated reservation against all rules
        const reservationToValidate = { ...existingReservation.toObject(), ...updateData };
        const validationResult = await this.validator.validate(reservationToValidate);
        if (!validationResult.valid) {
            throw new BadRequestException({
                message: 'Reservation validation failed',
                errors: validationResult.errors,
            });
        }

        // Step 7: Update in database
        const updatedReservation = await this.reservationModel
            .findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
            .lean()
            .exec() as any;

        if (!updatedReservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        // Step 6: Return mapped response
        return this.mapToResponseDto(updatedReservation);
    }

    /**
     * IMPERATIVE STYLE: Cancel a reservation
     * Step-by-step with status validation and authorization
     */
    async cancel(id: string, userId: string, userRole: UserRole): Promise<ReservationResponseDto> {
        // Step 1: Validate ID
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid reservation ID');
        }

        // Step 2: Find reservation
        const reservation = await this.reservationModel.findById(id);
        if (!reservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        // Step 3: Check authorization (only owner or admin can cancel)
        if (userRole !== UserRole.ADMIN && reservation.userId.toString() !== userId) {
            throw new ForbiddenException('You can only cancel your own reservations');
        }

        // Step 4: Check if cancellable
        if (reservation.status === 'cancelled') {
            throw new ConflictException('Reservation is already cancelled');
        }

        // Step 5: Update status
        reservation.status = 'cancelled' as any;
        await reservation.save();

        // Step 6: Return mapped response
        return this.mapToResponseDto(reservation);
    }

    /**
     * DECLARATIVE STYLE: Get availability
     * Returns actual available tables for a given date, time, and party size
     */
    async getAvailability(reservationDate: Date, reservationTime: string, partySize: number): Promise<any> {
        // Convert date to string format for comparison
        const dateStr = reservationDate.toISOString().split('T')[0];

        // Query existing reservations for the time slot
        const bookedReservations = await this.reservationModel
            .find({
                reservationDate: dateStr,
                reservationTime: reservationTime,
                status: { $in: ['confirmed', 'pending'] },
            })
            .lean()
            .exec();

        // Extract booked table IDs (filter out null/undefined)
        const bookedTableIds = bookedReservations
            .filter(r => r.tableId)
            .map(r => r.tableId!.toString());

        // Get all tables that can accommodate the party size
        const suitableTables = await this.tableModel
            .find({
                capacity: { $gte: partySize },
                isAvailable: true,
            })
            .sort({ capacity: 1 })
            .lean()
            .exec();

        // Filter out booked tables
        const availableTables = suitableTables.filter(
            table => !bookedTableIds.includes(table._id.toString())
        );

        // Return availability information
        return {
            date: dateStr,
            time: reservationTime,
            partySize,
            totalSuitableTables: suitableTables.length,
            bookedTables: bookedTableIds.length,
            availableTables: availableTables.map(t => ({
                id: t._id.toString(),
                capacity: t.capacity,
            })),
            hasAvailability: availableTables.length > 0,
        };
    }

    /**
     * IMPERATIVE STYLE: Delete a reservation (Admin only)
     * Step-by-step with validation
     */
    async delete(id: string): Promise<{ message: string }> {
        // Step 1: Validate ID
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid reservation ID');
        }

        // Step 2: Delete from database
        const result = await this.reservationModel.findByIdAndDelete(id);

        // Step 3: Check if existed
        if (!result) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        // Step 4: Return success response
        return { message: 'Reservation deleted successfully' };
    }

    /**
     * IMPERATIVE STYLE: Approve reservation (Admin only)
     * Assigns table and changes status to confirmed
     */
    async approveReservation(id: string, tableId: string): Promise<ReservationResponseDto> {
        // Step 1: Validate IDs
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid reservation ID');
        }
        if (!Types.ObjectId.isValid(tableId)) {
            throw new BadRequestException('Invalid table ID');
        }

        // Step 2: Find reservation
        const reservation = await this.reservationModel.findById(id);
        if (!reservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        // Step 3: Check if reservation is pending
        if (reservation.status !== 'pending') {
            throw new ConflictException('Only pending reservations can be approved');
        }

        // Step 4: Verify table exists and has sufficient capacity
        const table = await this.tableModel.findById(tableId);
        if (!table) {
            throw new NotFoundException(`Table with ID ${tableId} not found`);
        }
        if (table.capacity < reservation.partySize) {
            throw new BadRequestException(`Table capacity (${table.capacity}) is less than party size (${reservation.partySize})`);
        }

        // Step 5: Check if table is already booked for this date/time
        const conflict = await this.reservationModel.findOne({
            _id: { $ne: id },
            tableId: new Types.ObjectId(tableId),
            reservationDate: reservation.reservationDate,
            reservationTime: reservation.reservationTime,
            status: { $in: ['confirmed', 'pending'] },
        });

        if (conflict) {
            throw new ConflictException('Table is already booked for this time slot');
        }

        // Step 6: Approve reservation
        reservation.tableId = new Types.ObjectId(tableId) as any;
        reservation.status = 'confirmed' as any;
        await reservation.save();

        // Step 7: Return mapped response
        return this.mapToResponseDto(reservation);
    }

    /**
     * IMPERATIVE STYLE: Reject reservation (Admin only)
     * Changes status to cancelled
     */
    async rejectReservation(id: string): Promise<ReservationResponseDto> {
        // Step 1: Validate ID
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid reservation ID');
        }

        // Step 2: Find reservation
        const reservation = await this.reservationModel.findById(id);
        if (!reservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        // Step 3: Check if reservation is pending
        if (reservation.status !== 'pending') {
            throw new ConflictException('Only pending reservations can be rejected');
        }

        // Step 4: Reject reservation
        reservation.status = 'cancelled' as any;
        await reservation.save();

        // Step 5: Return mapped response
        return this.mapToResponseDto(reservation);
    }

    /**
     * DECLARATIVE STYLE: Get available tables for a date/time
     * Returns tables that can accommodate party size and are not booked
     */
    async getAvailableTables(reservationDate: string, reservationTime: string, partySize: number): Promise<any[]> {
        // Query existing reservations for the time slot
        const bookedReservations = await this.reservationModel
            .find({
                reservationDate,
                reservationTime,
                status: { $in: ['confirmed', 'pending'] },
            })
            .lean()
            .exec();

        // Extract booked table IDs
        const bookedTableIds = bookedReservations
            .filter(r => r.tableId)
            .map(r => r.tableId!.toString());

        // Get all tables that can accommodate the party size
        const suitableTables = await this.tableModel
            .find({
                capacity: { $gte: partySize },
                isAvailable: true,
            })
            .sort({ capacity: 1 })
            .lean()
            .exec();

        // Filter out booked tables
        return suitableTables
            .filter(table => !bookedTableIds.includes(table._id.toString()))
            .map(t => ({
                id: t._id.toString(),
                capacity: t.capacity,
                isAvailable: t.isAvailable,
            }));
    }

    /**
     * DECLARATIVE STYLE: Get my reservations (current user)
     * Returns all reservations for the authenticated user
     */
    async getMyReservations(userId: string): Promise<ReservationResponseDto[]> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('Invalid user ID');
        }

        return this.reservationModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ reservationDate: -1, reservationTime: -1 })
            .lean()
            .exec()
            .then((reservations: any[]) =>
                reservations.map(res => this.mapToResponseDto(res))
            );
    }

    /**
     * PRIVATE HELPER METHODS - Separation of Concerns
     */

    /**
     * Maps Reservation document to Response DTO
     * Follows Single Responsibility - only handles data transformation
     * Declarative approach using object literal
     */
    private mapToResponseDto(reservation: any): ReservationResponseDto {
        return {
            id: reservation._id?.toString() || reservation.id,
            customerName: reservation.customerName,
            customerEmail: reservation.customerEmail,
            reservationDate: reservation.reservationDate,
            reservationTime: reservation.reservationTime,
            partySize: reservation.partySize,
            tableId: reservation.tableId?.toString() || reservation.tableId,
            userId: reservation.userId?.toString() || reservation.userId,
            status: reservation.status,
            createdAt: reservation.createdAt || new Date(),
            updatedAt: reservation.updatedAt || new Date(),
        };
    }
}

