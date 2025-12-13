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
import { MailService } from '../auth/email/email-service';

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
    private readonly mailService: MailService,
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
   * IMPERATIVE STYLE: Create a new reservation with automatic table assignment
   * Automatically finds available table and confirms reservation (no pending status)
   * Duration: 2 hours by default
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
      customerEmail: user.email,
    };

    // Step 3: Validate input
    const validationResult = await this.validator.validate(reservationData);
    if (!validationResult.valid) {
      throw new BadRequestException({
        message: 'Reservation validation failed',
        errors: validationResult.errors,
      });
    }

    // Step 4: Calculate end time (2 hours after start time)
    const durationHours = 2;
    const endTime = this.calculateEndTime(createReservationDto.reservationTime, durationHours);

    // Step 5: Check for duplicate reservation (same user, same date, overlapping time)
    const existingReservation = await this.reservationModel.findOne({
      userId: new Types.ObjectId(userId),
      reservationDate: createReservationDto.reservationDate,
      status: 'confirmed',
      $or: [
        // Check if new reservation overlaps with existing ones
        {
          reservationTime: { $lte: createReservationDto.reservationTime },
          endTime: { $gt: createReservationDto.reservationTime }
        },
        {
          reservationTime: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        {
          reservationTime: { $gte: createReservationDto.reservationTime },
          endTime: { $lte: endTime }
        }
      ]
    });

    if (existingReservation) {
      throw new ConflictException('You already have a reservation at this time.');
    }

    // Step 6: Find an available table
    const availableTable = await this.findAvailableTable(
      createReservationDto.reservationDate,
      createReservationDto.reservationTime,
      endTime,
      createReservationDto.partySize
    );

    if (!availableTable) {
      throw new ConflictException('No available tables for the requested time and party size.');
    }

    // Step 7: Create and save the new reservation
    const newReservation = new this.reservationModel({
      customerName: createReservationDto.customerName,
      customerEmail: user.email,
      reservationDate: createReservationDto.reservationDate,
      reservationTime: createReservationDto.reservationTime,
      durationHours: durationHours,
      endTime: endTime,
      partySize: createReservationDto.partySize,
      userId: new Types.ObjectId(userId),
      tableId: availableTable._id, // Auto-assigned table
      status: 'confirmed', // Automatically confirmed
    });

    const savedReservation = await newReservation.save();

    // Step 8: Send confirmation email
    await this.mailService.sendReservationConfirmation({
      email: user.email,
      customerName: user.name,
      reservationId: savedReservation._id.toString(),
      reservationDate: savedReservation.reservationDate,
      reservationTime: savedReservation.reservationTime,
      partySize: savedReservation.partySize,
      tableNumber: availableTable.tableNumber,
      hasPreOrder: savedReservation.hasPreOrder,
    });

    return this.mapper.toResponseDto(savedReservation);
  }

  /**
     * DECLARATIVE STYLE: Find all reservations
     * Uses functional approach with filtering and mapping
     */
    async findAll(): Promise<ReservationResponseDto[]> {
        return this.reservationModel
            .find()
            .populate('tableId') // Populate table information
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
            .populate('tableId') // Populate table information
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

        // Query database and populate table information
        const reservation = await this.reservationModel
            .findById(id)
            .populate('tableId')
            .lean()
            .exec() as any;

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

        // Step 3: Check authorization (owner, staff, or admin can update)
        if (userRole !== UserRole.ADMIN && userRole !== UserRole.STAFF && existingReservation.userId.toString() !== userId) {
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
            .populate('tableId') // Populate table information
            .lean()
            .exec() as any;

        if (!updatedReservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        // Step 8: Return mapped response with table number
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

        // Step 3: Check authorization (owner, staff, or admin can cancel)
        if (userRole !== UserRole.ADMIN && userRole !== UserRole.STAFF && reservation.userId.toString() !== userId) {
            throw new ForbiddenException('You can only cancel your own reservations');
        }

        // Step 4: Check if cancellable
        if (reservation.status === 'cancelled') {
            throw new ConflictException('Reservation is already cancelled');
        }

        // Step 5: Update status
        reservation.status = 'cancelled' as any;
        await reservation.save();

        // Step 6: Populate table information and return
        const populatedReservation = await this.reservationModel
            .findById(id)
            .populate('tableId')
            .lean()
            .exec();

        return this.mapToResponseDto(populatedReservation);
    }

    /**
     * DECLARATIVE STYLE: Get availability
     * Returns actual available tables for a given date, time, and party size
     * Date format: DD/MM/YYYY
     * Time format: HH:MM
     */
    async getTableAvailability(reservationDate: string, startTime: string, endTime: string, partySize: number): Promise<any> {
    const requestedStartTime = startTime;
    const requestedEndTime = endTime;

    console.log('=== getTableAvailability called ===');
    console.log('Parameters:', { reservationDate, startTime, endTime, partySize });

    // Step 1: Get all reservations for the specified date to check for conflicts.
    const reservationsOnDate = await this.reservationModel
        .find({
            reservationDate: reservationDate,
            status: { $in: ['confirmed', 'pending'] },
        })
        .populate('tableId') // Populate tableId to ensure it's a proper object
        .lean()
        .exec();

    console.log('Reservations found on date:', reservationsOnDate.length);
    reservationsOnDate.forEach((r, i) => {
        console.log(`Reservation ${i + 1}:`, {
            tableId: r.tableId?.toString(),
            time: r.reservationTime,
            endTime: r.endTime,
            status: r.status
        });
    });

    // Step 2: Get all tables that can accommodate the party size.
    const suitableTables = await this.tableModel
        .find({ capacity: { $gte: partySize }, isAvailable: true })
        .sort({ tableNumber: 1 })
        .lean()
        .exec();

    console.log('Suitable tables found:', suitableTables.length);
    suitableTables.forEach(t => {
        console.log(`Table: ${t.tableNumber}, ID: ${t._id.toString()}, Capacity: ${t.capacity}`);
    });

    // Step 3: Determine the actual availability of each suitable table.
    const tablesWithAvailability = suitableTables.map(table => {
      const tableIdStr = table._id.toString();

      const isBooked = reservationsOnDate.some(reservation => {
        if (!reservation.tableId) {
          console.log(`Reservation has no tableId, skipping`);
          return false;
        }

        // Handle both populated and non-populated tableId
        let reservationTableIdStr: string;
        if (typeof reservation.tableId === 'object' && (reservation.tableId as any)._id) {
          // TableId is populated (has table details)
          reservationTableIdStr = (reservation.tableId as any)._id.toString();
        } else {
          // TableId is just an ObjectId
          reservationTableIdStr = reservation.tableId.toString();
        }

        if (reservationTableIdStr !== tableIdStr) {
          return false; // Different table, no conflict
        }

        const reservationEndTime = reservation.endTime || this.calculateEndTime(reservation.reservationTime, reservation.durationHours || 2);

        console.log(`Checking table ${table.tableNumber} (${tableIdStr})`);
        console.log(`  Reservation tableId: ${reservationTableIdStr}`);
        console.log(`  Requested: ${requestedStartTime} - ${requestedEndTime}`);
        console.log(`  Existing: ${reservation.reservationTime} - ${reservationEndTime}`);

        const overlaps = this.doTimesOverlap(
            requestedStartTime,
            requestedEndTime,
            reservation.reservationTime,
            reservationEndTime
        );

        console.log(`  Overlaps: ${overlaps}`);

        return overlaps;
      });

      console.log(`Table ${table.tableNumber}: isBooked = ${isBooked}`);

      return {
        ...table,
        isBooked,
        canAccommodate: true,
        isAvailable: !isBooked,
      };
    });

    const availableTables = tablesWithAvailability.filter(t => t.isAvailable);
    const bookedTables = tablesWithAvailability.filter(t => !t.isAvailable);

    console.log('=== Results ===');
    console.log('Available tables:', availableTables.map(t => t.tableNumber));
    console.log('Booked tables:', bookedTables.map(t => t.tableNumber));

    return {
        date: reservationDate,
        startTime,
        endTime,
        partySize,
        tables: availableTables,
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

        // Step 7: Send confirmation email with table assignment (non-blocking)
        try {
            const user = await this.usersService.findById(reservation.userId.toString());
            if (user) {
                await this.mailService.sendReservationConfirmation({
                    email: user.email,
                    customerName: user.name,
                    reservationId: reservation._id.toString(),
                    reservationDate: reservation.reservationDate,
                    reservationTime: reservation.reservationTime,
                    partySize: reservation.partySize,
                    tableNumber: table.tableNumber?.toString(),
                    hasPreOrder: reservation.hasPreOrder || false,
                });
            }
        } catch (emailError) {
            console.error('Failed to send approval confirmation email:', emailError);
            // Continue even if email fails - reservation was approved successfully
        }

        // Step 8: Return mapped response
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
                status: 'available'  // Must also check status enum
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
            .populate('tableId') // Populate table information to get tableNumber
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
     * Calculate end time by adding duration hours to start time
     * Format: HH:MM
     */
    private calculateEndTime(startTime: string, durationHours: number): string {
        const [hours, minutes] = startTime.split(':').map(Number);
        let endHours = hours + durationHours;
        const endMinutes = minutes;

        // Handle day overflow (e.g., 23:00 + 2 hours = 01:00 next day)
        if (endHours >= 24) {
            endHours = endHours % 24;
        }

        // Format with leading zeros
        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    }

    /**
     * Find an available table for the given date, time range, and party size
     * Checks for time overlaps with existing reservations
     */
    private async findAvailableTable(
        reservationDate: string,
        startTime: string,
        endTime: string,
        partySize: number
    ): Promise<any> {
        // Step 1: Find all table IDs that have conflicting reservations on the given date and time
        const conflictingReservations = await this.reservationModel.find({
            reservationDate: reservationDate,
            status: { $in: ['confirmed', 'pending'] },
            $or: [
                { // Reservation starts during the requested slot
                    reservationTime: { $gte: startTime, $lt: endTime }
                },
                { // Reservation ends during the requested slot
                    endTime: { $gt: startTime, $lte: endTime }
                },
                { // Reservation envelops the requested slot
                    reservationTime: { $lte: startTime },
                    endTime: { $gte: endTime }
                }
            ]
        }).distinct('tableId');

        const conflictingTableIds = conflictingReservations.map(id => id.toString());

        // Step 2: Find a table that meets the criteria and is NOT in the list of conflicting tables
        const availableTable = await this.tableModel.findOne({
            capacity: { $gte: partySize },
            isAvailable: true,
            _id: { $nin: conflictingTableIds }
        })
        .sort({ capacity: 1 }) // Prefer smaller tables first
        .lean()
        .exec();

        return availableTable; // This will be the first available table or null
    }

    /**
     * Check if two time ranges overlap
     * Time format: HH:MM
     */
    private doTimesOverlap(
        start1: string,
        end1: string,
        start2: string,
        end2: string
    ): boolean {
        // Convert times to minutes for easier comparison
        const toMinutes = (time: string): number => {
            if (!time || !time.includes(':')) {
                return -1;
            }
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const s1 = toMinutes(start1);
        const e1 = toMinutes(end1);
        const s2 = toMinutes(start2);
        const e2 = toMinutes(end2);

        console.log(`doTimesOverlap: s1=${s1}, e1=${e1}, s2=${s2}, e2=${e2}`);

        // If any time is invalid, assume overlap for safety
        if (s1 === -1 || e1 === -1 || s2 === -1 || e2 === -1) {
            console.log('Invalid time detected, assuming overlap');
            return true;
        }

        // Two time ranges overlap if one starts before the other ends
        // Range 1: [s1, e1), Range 2: [s2, e2)
        // Overlap exists if: s1 < e2 AND s2 < e1
        const overlaps = s1 < e2 && s2 < e1;
        console.log(`Overlap result: ${overlaps}`);
        return overlaps;
    }

    /**
     * Maps Reservation document to Response DTO
     * Follows Single Responsibility - only handles data transformation
     * Declarative approach using object literal
     * Includes tableNumber from populated table data
     */
    private mapToResponseDto(reservation: any): ReservationResponseDto {
        // Extract tableNumber from populated table data
        let tableNumber: string | undefined;
        if (reservation.tableId) {
            if (typeof reservation.tableId === 'object' && reservation.tableId.tableNumber) {
                // Table is populated
                tableNumber = reservation.tableId.tableNumber;
            }
        }

        return {
            id: reservation._id?.toString() || reservation.id,
            customerName: reservation.customerName,
            customerEmail: reservation.customerEmail,
            reservationDate: reservation.reservationDate,
            reservationTime: reservation.reservationTime,
            endTime: reservation.endTime,
            durationHours: reservation.durationHours,
            partySize: reservation.partySize,
            tableId: reservation.tableId?._id?.toString() || reservation.tableId?.toString() || reservation.tableId,
            tableNumber: tableNumber, // Include table number in response
            userId: reservation.userId?.toString() || reservation.userId,
            status: reservation.status,
            createdAt: reservation.createdAt || new Date(),
            updatedAt: reservation.updatedAt || new Date(),
        };
    }
}
