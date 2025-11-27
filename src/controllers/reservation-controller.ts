import {
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { ReservationService } from '../services/reservation.service';
import { CreateReservationDto, UpdateReservationDto, ReservationResponseDto } from '../dto/reservation-dto';
import { JwtAuthGuard } from '../auth/guards/authentication-guard';

/**
 * Reservation Controller
 *
 * Responsibilities:
 * - Handle HTTP requests/responses
 * - Route requests to service layer
 * - Validate request format
 * - Apply security guards
 *
 * Separation of Concerns:
 * - Business logic delegated to service
 * - Validation delegated to DTOs and service
 * - Database operations delegated to service
 */
@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) {}

    /**
     * Create a new reservation
     * POST /reservations
     * IMPERATIVE: Direct call to service with error handling
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createReservationDto: CreateReservationDto): Promise<ReservationResponseDto> {
        return this.reservationService.create(createReservationDto);
    }

    /**
     * Get all reservations
     * GET /reservations
     * DECLARATIVE: Composition of database query and mapping
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<ReservationResponseDto[]> {
        return this.reservationService.findAll();
    }

    /**
     * Get reservations by date range
     * GET /reservations/range?startDate=2024-12-01&endDate=2024-12-31
     * DECLARATIVE: Query filtering and mapping
     */
    @Get('range')
    @HttpCode(HttpStatus.OK)
    async findByDateRange(
        @Query('startDate') startDateStr: string,
        @Query('endDate') endDateStr: string,
    ): Promise<ReservationResponseDto[]> {
        // Validate date parameters
        if (!startDateStr || !endDateStr) {
            throw new BadRequestException('startDate and endDate query parameters are required');
        }

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new BadRequestException('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)');
        }

        if (startDate > endDate) {
            throw new BadRequestException('startDate must be before endDate');
        }

        return this.reservationService.findByDateRange(startDate, endDate);
    }

    /**
     * Get reservations by user ID
     * GET /reservations/user/:userId
     * DECLARATIVE: Filtered query by user
     */
    @Get('user/:userId')
    @HttpCode(HttpStatus.OK)
    async findByUserId(@Param('userId') userId: string): Promise<ReservationResponseDto[]> {
        return this.reservationService.findByUserId(userId);
    }

    /**
     * Get a single reservation by ID
     * GET /reservations/:id
     * IMPERATIVE: Single resource fetch with error handling
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findById(@Param('id') id: string): Promise<ReservationResponseDto> {
        return this.reservationService.findById(id);
    }

    /**
     * Check availability for a time slot
     * GET /reservations/availability?date=2024-12-15&time=19:00&partySize=4
     * DECLARATIVE: Availability query
     */
    @Get('availability/check')
    @HttpCode(HttpStatus.OK)
    async checkAvailability(
        @Query('date') dateStr: string,
        @Query('time') time: string,
        @Query('partySize') partySizeStr: string,
    ): Promise<any> {
        // Validate parameters
        if (!dateStr || !time || !partySizeStr) {
            throw new BadRequestException('date, time, and partySize query parameters are required');
        }

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            throw new BadRequestException('Invalid date format. Use ISO 8601 format (YYYY-MM-DD)');
        }

        const partySize = parseInt(partySizeStr, 10);
        if (isNaN(partySize) || partySize < 1 || partySize > 20) {
            throw new BadRequestException('partySize must be a number between 1 and 20');
        }

        return this.reservationService.getAvailability(date, time, partySize);
    }

    /**
     * Update a reservation
     * PUT /reservations/:id
     * IMPERATIVE: Step-by-step update with validation
     */
    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body() updateReservationDto: UpdateReservationDto,
    ): Promise<ReservationResponseDto> {
        return this.reservationService.update(id, updateReservationDto);
    }

    /**
     * Cancel a reservation
     * PUT /reservations/:id/cancel
     * IMPERATIVE: Status change operation
     */
    @Put(':id/cancel')
    @HttpCode(HttpStatus.OK)
    async cancel(@Param('id') id: string): Promise<ReservationResponseDto> {
        return this.reservationService.cancel(id);
    }

    /**
     * Delete a reservation
     * DELETE /reservations/:id
     * IMPERATIVE: Deletion with validation
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string): Promise<void> {
        await this.reservationService.delete(id);
    }
}

