/**
 * Reservation Mapper Service
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles data transformation between domain and DTO
 * - Open/Closed: Can be extended with new mapping methods
 */

import { Injectable } from '@nestjs/common';
import { ReservationDocument } from '../../models/Reservation.schema';
import { ReservationResponseDto } from '../../dto/reservation-dto';

@Injectable()
export class ReservationMapperService {
  /**
   * Maps Reservation document to Response DTO
   * DECLARATIVE: Pure transformation function
   */
  toResponseDto(reservation: ReservationDocument | any): ReservationResponseDto {
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

  /**
   * Maps multiple reservations to DTOs
   * DECLARATIVE: Functional mapping
   */
  toResponseDtoList(reservations: (ReservationDocument | any)[]): ReservationResponseDto[] {
    return reservations.map(reservation => this.toResponseDto(reservation));
  }
}

