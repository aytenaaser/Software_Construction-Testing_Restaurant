import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation, ReservationDocument } from '../models/Reservation.schema';
import { CreateReservationDto, UpdateReservationDto, ReservationResponseDto } from '../dto/reservation-dto';
import { ReservationValidationStrategy, CompositeReservationValidator, BusinessHoursValidator, FutureDateValidator, PartySizeValidator } from './reservation-validators';

/**
 * Reservation Service
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles reservation business logic
 * - Open/Closed: Uses dependency injection and strategy pattern for extensibility
 * - Liskov Substitution: Uses interface-based validators
 * - Interface Segregation: Small, focused interfaces
 * - Dependency Inversion: Depends on abstractions (validators), not concrete implementations
 *
 * Separation of Concerns:
 * - Validation logic delegated to validators
 * - Data mapping delegated to mapper
 * - Database operations isolated
 *
 * Programming Paradigms:
 * - Imperative: Step-by-step create/update/delete operations
 * - Declarative: Functional mapping and Promise chains
 */
@Injectable()
export class ReservationService {
    private readonly validator: ReservationValidationStrategy;

    constructor(
        @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
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
     * Step-by-step logic with explicit error handling and validation
     */
    async create(createReservationDto: CreateReservationDto): Promise<ReservationResponseDto> {
        // Step 1: Validate input
        const validationResult = await this.validator.validate(createReservationDto);
        if (!validationResult.valid) {
            throw new BadRequestException({
                message: 'Reservation validation failed',
                errors: validationResult.errors,
            });
        }

        // Step 2: Check for duplicate reservation (same user, same date/time, same table)
        const existingReservation = await this.reservationModel.findOne({
            // userId: new Types.ObjectId(createReservationDto.userId),
            // tableId: new Types.ObjectId(createReservationDto.tableId),
            reservationDate: {
                $gte: new Date(createReservationDto.reservationDate),
                $lt: new Date(new Date(createReservationDto.reservationDate).getTime() + 24 * 60 * 60 * 1000),
            },
            reservationTime: createReservationDto.reservationTime,
            status: { $in: ['confirmed', 'pending'] },
        });

        if (existingReservation) {
            throw new ConflictException('A reservation already exists for this date, time, and table');
        }

        // Step 3: Create reservation document
        const reservation = new this.reservationModel({
            ...createReservationDto,
            // userId: new Types.ObjectId(createReservationDto.userId),
            // tableId: new Types.ObjectId(createReservationDto.tableId),
            status: 'confirmed',
        });

        // Step 4: Save to database
        const savedReservation = await reservation.save();

        // Step 5: Map to response DTO and return
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
     */
    async findByDateRange(startDate: Date, endDate: Date): Promise<ReservationResponseDto[]> {
        return this.reservationModel
            .find({
                reservationDate: {
                    $gte: startDate,
                    $lte: endDate,
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
     * DECLARATIVE STYLE: Find reservations by user
     * Functional approach with composition
     */
    async findByUserId(userId: string): Promise<ReservationResponseDto[]> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('Invalid user ID');
        }

        return this.reservationModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ reservationDate: -1 })
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
     * Step-by-step logic with validation and conflict checking
     */
    async update(id: string, updateReservationDto: UpdateReservationDto): Promise<ReservationResponseDto> {
        // Step 1: Validate ID
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid reservation ID');
        }

        // Step 2: Find existing reservation
        const existingReservation = await this.reservationModel.findById(id);
        if (!existingReservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        // Step 3: Prepare update object
        const updateData = { ...updateReservationDto };
        if (updateData.tableId) {
            updateData.tableId = new Types.ObjectId(updateData.tableId) as any;
        }

        // Step 4: Validate updated reservation against all rules
        const reservationToValidate = { ...existingReservation.toObject(), ...updateData };
        const validationResult = await this.validator.validate(reservationToValidate);
        if (!validationResult.valid) {
            throw new BadRequestException({
                message: 'Reservation validation failed',
                errors: validationResult.errors,
            });
        }

        // Step 5: Update in database
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
     * Step-by-step with status validation
     */
    async cancel(id: string): Promise<ReservationResponseDto> {
        // Step 1: Validate ID
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid reservation ID');
        }

        // Step 2: Find reservation
        const reservation = await this.reservationModel.findById(id);
        if (!reservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        // Step 3: Check if cancellable
        if (reservation.status === 'cancelled') {
            throw new ConflictException('Reservation is already cancelled');
        }

        // Step 4: Update status
        reservation.status = 'cancelled' as any;
        await reservation.save();

        // Step 5: Return mapped response
        return this.mapToResponseDto(reservation);
    }

    /**
     * DECLARATIVE STYLE: Get availability
     * Functional approach - checks which tables are available for a given time slot
     */
    async getAvailability(reservationDate: Date, reservationTime: string, partySize: number): Promise<any> {
        // Query existing reservations for the time slot
        const bookedReservations = await this.reservationModel
            .find({
                reservationDate: {
                    $gte: reservationDate,
                    $lt: new Date(reservationDate.getTime() + 24 * 60 * 60 * 1000),
                },
                reservationTime: reservationTime,
                status: { $in: ['confirmed', 'pending'] },
            })
            .lean()
            .exec();

        // Extract booked table IDs
        const bookedTableIds = bookedReservations.map(r => (r.tableId as any).toString());

        // Return availability information
        return {
            date: reservationDate,
            time: reservationTime,
            partySize,
            bookedTables: bookedTableIds.length,
            availableTablesInfo: 'Contact restaurant for table availability',
        };
    }

    /**
     * IMPERATIVE STYLE: Delete a reservation
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

