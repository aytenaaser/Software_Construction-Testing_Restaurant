import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reservation, ReservationSchema } from '../models/Reservation.schema';
import { ReservationService } from '../services/reservation.service';
import { ReservationController } from '../controllers/reservation-controller';
import {AuthModule} from "../auth/auth-module";

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
        MongooseModule.forFeature([
            {
                name: Reservation.name,
                schema: ReservationSchema,
            },

        ]),
    ],
    controllers: [ReservationController],
    providers: [ReservationService],
    exports: [ReservationService], // Export service for use in other modules
})
export class ReservationModule {}

