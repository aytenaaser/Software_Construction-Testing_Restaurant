
/**
 * Repository Interface for Reservation
 *
 * SOLID Principles:
 * - Interface Segregation: Small, focused interface
 * - Dependency Inversion: Services depend on this abstraction, not concrete implementations
 * - Single Responsibility: Only handles data persistence operations
 */

import { ReservationDocument } from '../../models/Reservation.schema';
import { CreateReservationDto, UpdateReservationDto } from '../../dto/reservation-dto';

export interface IReservationRepository {
  create(data: CreateReservationDto): Promise<ReservationDocument>;
  findAll(): Promise<ReservationDocument[]>;
  findById(id: string): Promise<ReservationDocument | null>;
  findByUserId(userId: string): Promise<ReservationDocument[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<ReservationDocument[]>;
  findByDateTimeAndStatus(
    reservationDate: Date,
    reservationTime: string,
    statuses: string[]
  ): Promise<ReservationDocument[]>;
  update(id: string, data: UpdateReservationDto): Promise<ReservationDocument | null>;
  delete(id: string): Promise<boolean>;
}

