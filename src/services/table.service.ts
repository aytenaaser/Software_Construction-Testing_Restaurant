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
   * DECLARATIVE STYLE: Find available tables
   * Functional filtering
   */
  async findAvailable(): Promise<Table[]> {
    return this.tableModel
      .find({ isAvailable: true })
      .sort({ capacity: 1 })
      .lean()
      .exec();
  }

  /**
   * DECLARATIVE STYLE: Find tables by capacity
   * Functional filtering for tables that can accommodate party size
   */
  async findByCapacity(partySize: number): Promise<Table[]> {
    return this.tableModel
      .find({
        capacity: { $gte: partySize },
        isAvailable: true,
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

