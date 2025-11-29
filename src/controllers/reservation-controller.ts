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
  Request,
} from '@nestjs/common';
import { ReservationService } from '../services/reservation.service';
import {
  CreateReservationDto,
  UpdateReservationDto,
  ReservationResponseDto,
} from '../dto/reservation-dto';
import { JwtAuthGuard } from '../auth/guards/authentication-guard';
import { RolesGuard } from '../auth/guards/authorization-guard';
import { Roles } from '../auth/decorators/roles-decorator';
import { UserRole } from '../models/user.schema';

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
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  /**
   * Create a new reservation
   * POST /reservations
   * IMPERATIVE: Direct call to service with error handling
   * Available to all authenticated users
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @Request() req: any,
  ): Promise<ReservationResponseDto> {
    const userId = req.user?.sub;
    return this.reservationService.create(createReservationDto, userId);
  }

  /**
   * Get all reservations (Admin only)
   * GET /reservations
   * DECLARATIVE: Composition of database query and mapping
   */
  @Get()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ReservationResponseDto[]> {
    return this.reservationService.findAll();
  }

  /**
   * Get my reservations (Current user)
   * GET /reservations/my-reservations
   * Returns all reservations for the authenticated user
   */
  @Get('my-reservations')
  @HttpCode(HttpStatus.OK)
  async getMyReservations(@Request() req: any): Promise<ReservationResponseDto[]> {
    const userId = req.user?.sub;
    return this.reservationService.getMyReservations(userId);
  }

  /**
   * Get reservations by date range (Admin only)
   * GET /reservations/range?startDate=2024-12-01&endDate=2024-12-31
   * DECLARATIVE: Query filtering and mapping
   */
  @Get('range')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async findByDateRange(
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
  ): Promise<ReservationResponseDto[]> {
    // Validate date parameters
    if (!startDateStr || !endDateStr) {
      throw new BadRequestException(
        'startDate and endDate query parameters are required',
      );
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException(
        'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)',
      );
    }

    if (startDate > endDate) {
      throw new BadRequestException('startDate must be before endDate');
    }

    return this.reservationService.findByDateRange(startDate, endDate);
  }

  /**
   * Get a single reservation by ID (Admin only)
   * GET /reservations/:id
   * IMPERATIVE: Single resource fetch with error handling
   */
  @Get(':id')
  @Roles(UserRole.ADMIN)
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
      throw new BadRequestException(
        'date, time, and partySize query parameters are required',
      );
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)',
      );
    }

    const partySize = parseInt(partySizeStr, 10);
    if (isNaN(partySize) || partySize < 1 || partySize > 20) {
      throw new BadRequestException(
        'partySize must be a number between 1 and 20',
      );
    }

    return this.reservationService.getAvailability(date, time, partySize);
  }

  /**
   * Update a reservation (Owner or Admin only)
   * PUT /reservations/:id
   * IMPERATIVE: Step-by-step update with validation
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
    @Request() req: any,
  ): Promise<ReservationResponseDto> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    return this.reservationService.update(id, updateReservationDto, userId, userRole);
  }

  /**
   * Cancel a reservation (Owner or Admin only)
   * PUT /reservations/:id/cancel
   * IMPERATIVE: Status change operation
   */
  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') id: string, @Request() req: any): Promise<ReservationResponseDto> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    return this.reservationService.cancel(id, userId, userRole);
  }

  /**
   * Approve a reservation (Admin only)
   * PUT /reservations/:id/approve
   * Assigns a table and confirms the reservation
   */
  @Put(':id/approve')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id') id: string,
    @Body('tableId') tableId: string,
  ): Promise<ReservationResponseDto> {
    return this.reservationService.approveReservation(id, tableId);
  }

  /**
   * Reject a reservation (Admin only)
   * PUT /reservations/:id/reject
   * Changes status to cancelled
   */
  @Put(':id/reject')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async reject(@Param('id') id: string): Promise<ReservationResponseDto> {
    return this.reservationService.rejectReservation(id);
  }

  /**
   * Get available tables for a time slot
   * GET /reservations/available-tables?date=2024-12-20&time=19:00&partySize=4
   * Returns list of available tables
   */
  @Get('available-tables')
  @HttpCode(HttpStatus.OK)
  async getAvailableTables(
    @Query('date') dateStr: string,
    @Query('time') time: string,
    @Query('partySize') partySizeStr: string,
  ): Promise<any[]> {
    // Validate parameters
    if (!dateStr || !time || !partySizeStr) {
      throw new BadRequestException(
        'date, time, and partySize query parameters are required',
      );
    }

    const partySize = parseInt(partySizeStr, 10);
    if (isNaN(partySize) || partySize < 1 || partySize > 20) {
      throw new BadRequestException(
        'partySize must be a number between 1 and 20',
      );
    }

    return this.reservationService.getAvailableTables(dateStr, time, partySize);
  }

  /**
   * Delete a reservation (Admin only)
   * DELETE /reservations/:id
   * IMPERATIVE: Deletion with validation
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.reservationService.delete(id);
  }
}
