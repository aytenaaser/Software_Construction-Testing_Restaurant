import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reservation, ReservationSchema } from '../models/Reservation.schema';
import { Table, TableSchema } from '../models/Table.schema';
import { ReservationService } from '../services/reservation.service';
import { ReservationController } from '../controllers/reservation-controller';
import { ReservationMapperService } from '../services/mappers/reservation-mapper.service';
import { AuthModule } from '../auth/auth-module';
import { UsersModule } from './user-module';
import { TableModule } from './table-module';

/**
 * Reservation Module
 *
 * Encapsulates all reservation-related functionality
 * Follows Modular Architecture Principle
 * - Single responsibility: manages reservations only
 * - Independently testable
 * - Loosely coupled with other modules
 */
@Module({
  imports: [
    AuthModule,
    UsersModule,
    TableModule,
    MongooseModule.forFeature([
      {
        name: Reservation.name,
        schema: ReservationSchema,
      },
      {
        name: Table.name,
        schema: TableSchema,
      },
    ]),
  ],
  controllers: [ReservationController],
  providers: [ReservationService, ReservationMapperService],
  exports: [ReservationService], // Export service for use in other modules
})
export class ReservationModule {}
