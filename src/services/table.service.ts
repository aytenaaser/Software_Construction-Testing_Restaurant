/**
 * Table Service
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles table business logic
 * - Open/Closed: Can be extended with new methods without modifying existing code
 * - Dependency Inversion: Depends on Model abstraction
 *
 * Programming Paradigms:
 * - Imperative: Step-by-step create/update/delete operations
 * - Declarative: Functional mapping and querying
 */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Table, TableDocument } from '../models/Table.schema';
import { CreateTableDto, UpdateTableDto } from '../dto/table-dto';

@Injectable()
export class TableService {
  constructor(
    @InjectModel(Table.name)
    private tableModel: Model<TableDocument>,
  ) {}

  /**
   * IMPERATIVE STYLE: Create a new table
   * Step-by-step validation and creation
   */
  async create(createTableDto: CreateTableDto): Promise<Table> {
    // Validate capacity
    if (createTableDto.capacity < 1 || createTableDto.capacity > 20) {
      throw new BadRequestException('Table capacity must be between 1 and 20');
    }

    // Create table
    const table = new this.tableModel(createTableDto);
    return table.save();
  }

  /**
   * DECLARATIVE STYLE: Find all tables
   * Functional approach with mapping
   */
  async findAll(): Promise<Table[]> {
    return this.tableModel
      .find()
      .sort({ capacity: 1 })
      .lean()
      .exec();
  }

  /**
   * Find available tables for a specific date and time range
   * @param date - Date in format DD/MM/YYYY
   * @param fromHour - Start hour (0-23)
   * @param toHour - End hour (0-23)
   * Checks both isAvailable flag AND status field
   * Also checks for existing reservations in the time range
   */
  async findAvailable(date: string, fromHour: number, toHour: number): Promise<any> {
    // Validate hour range
    if (fromHour < 0 || fromHour > 23 || toHour < 0 || toHour > 23) {
      throw new BadRequestException('Hours must be between 0 and 23');
    }
    if (fromHour >= toHour) {
      throw new BadRequestException('fromHour must be less than toHour');
    }

    // Convert DD/MM/YYYY to YYYY-MM-DD for database query
    const [day, month, year] = date.split('/');
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    // Get all tables that are generally available
    const allTables = await this.tableModel
      .find({
        isAvailable: true,
        status: 'available'
      })
      .sort({ capacity: 1 })
      .lean()
      .exec();

    // Import reservation model to check bookings
    const ReservationModel = this.tableModel.db.model('Reservation');

    // Find all reservations for this date in the time range
    const reservations = await ReservationModel
      .find({
        reservationDate: isoDate,
        status: { $in: ['confirmed', 'pending'] }
      })
      .lean()
      .exec();

    // Filter reservations that fall within the time range
    const conflictingReservations = reservations.filter((reservation: any) => {
      const reservationHour = parseInt(reservation.reservationTime.split(':')[0]);
      return reservationHour >= fromHour && reservationHour < toHour;
    });

    // Get IDs of booked tables
    const bookedTableIds = conflictingReservations
      .filter((r: any) => r.tableId)
      .map((r: any) => r.tableId.toString());

    // Filter out booked tables
    const availableTables = allTables.filter(
      table => !bookedTableIds.includes(table._id.toString())
    );

    return {
      date: date,
      timeRange: `${fromHour}:00 - ${toHour}:00`,
      totalTables: allTables.length,
      bookedTables: bookedTableIds.length,
      availableTables: availableTables.map(t => ({
        id: t._id.toString(),
        tableNumber: t.tableNumber,
        capacity: t.capacity,
        floor: t.floor,
        position: t.position,
        shape: t.shape
      })),
      availableCount: availableTables.length
    };
  }

  /**
   * DECLARATIVE STYLE: Find tables by capacity
   * Functional filtering for tables that can accommodate party size
   * Checks both isAvailable flag AND status field
   */
  async findByCapacity(partySize: number): Promise<Table[]> {
    return this.tableModel
      .find({
        capacity: { $gte: partySize },
        isAvailable: true,
        status: 'available'  // Must also check status enum
      })
      .sort({ capacity: 1 })
      .lean()
      .exec();
  }

  /**
   * IMPERATIVE STYLE: Find table by ID
   * Step-by-step with error handling
   */
  async findById(id: string): Promise<Table> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid table ID');
    }

    const table = await this.tableModel.findById(id).lean().exec();

    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    return table as Table;
  }

  /**
   * IMPERATIVE STYLE: Update table
   * Step-by-step validation and update
   */
  async update(id: string, updateTableDto: UpdateTableDto): Promise<Table> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid table ID');
    }

    // Validate capacity if provided
    if (updateTableDto.capacity !== undefined) {
      if (updateTableDto.capacity < 1 || updateTableDto.capacity > 20) {
        throw new BadRequestException('Table capacity must be between 1 and 20');
      }
    }

    const updatedTable = await this.tableModel
      .findByIdAndUpdate(id, { $set: updateTableDto }, { new: true, runValidators: true })
      .lean()
      .exec();

    if (!updatedTable) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    return updatedTable as Table;
  }

  /**
   * IMPERATIVE STYLE: Delete table
   * Step-by-step with validation
   */
  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid table ID');
    }

    const result = await this.tableModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
  }

  /**
   * IMPERATIVE STYLE: Toggle table availability
   * Used internally by reservation system
   */
  async setAvailability(id: string, isAvailable: boolean): Promise<Table> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid table ID');
    }

    const table = await this.tableModel
      .findByIdAndUpdate(
        id,
        { $set: { isAvailable } },
        { new: true, runValidators: true },
      )
      .lean()
      .exec();

    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    return table as Table;
  }
}

