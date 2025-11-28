/**
 * Concrete Implementation of Reservation Repository
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles database operations
 * - Dependency Inversion: Implements repository interface
 * - Open/Closed: Can be extended without modifying the interface
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation, ReservationDocument } from '../models/Reservation.schema';
import { CreateReservationDto, UpdateReservationDto } from '../dto/reservation-dto';
import { IReservationRepository } from '../services/interfaces/reservation-repository.interface';


@Injectable()
export class ReservationRepository implements IReservationRepository {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
  ) {}

  async create(data: CreateReservationDto): Promise<ReservationDocument> {
    const reservation = new this.reservationModel({
      ...data,
      status: 'confirmed',
    });
    return reservation.save();
  }

  async findAll(): Promise<ReservationDocument[]> {
    return this.reservationModel
      .find()
      .sort({ reservationDate: -1, reservationTime: 1 })
      .lean()
      .exec() as any;
  }

  async findById(id: string): Promise<ReservationDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid reservation ID');
    }
    return this.reservationModel.findById(id).lean().exec() as any;
  }

  async findByUserId(userId: string): Promise<ReservationDocument[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.reservationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ reservationDate: -1 })
      .lean()
      .exec() as any;
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ReservationDocument[]> {
    return this.reservationModel
      .find({
        reservationDate: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ reservationDate: 1, reservationTime: 1 })
      .lean()
      .exec() as any;
  }

  async findByDateTimeAndStatus(
    reservationDate: Date,
    reservationTime: string,
    statuses: string[],
  ): Promise<ReservationDocument[]> {
    return this.reservationModel
      .find({
        reservationDate: {
          $gte: reservationDate,
          $lt: new Date(reservationDate.getTime() + 24 * 60 * 60 * 1000),
        },
        reservationTime: reservationTime,
        status: { $in: statuses },
      })
      .lean()
      .exec() as any;
  }

  async update(id: string, data: UpdateReservationDto): Promise<ReservationDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid reservation ID');
    }

    const updateData = { ...data };
    if (updateData.tableId) {
      updateData.tableId = new Types.ObjectId(updateData.tableId) as any;
    }

    return this.reservationModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .lean()
      .exec() as any;
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid reservation ID');
    }
    const result = await this.reservationModel.findByIdAndDelete(id);
    return !!result;
  }
}

