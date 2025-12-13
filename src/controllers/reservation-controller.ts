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
   * Get all reservations (Admin and Staff)
   * GET /reservations
   * DECLARATIVE: Composition of database query and mapping
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
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
   * Get reservations by date range (Admin and Staff)
   * GET /reservations/range?startDate=2024-12-01&endDate=2024-12-31
   * DECLARATIVE: Query filtering and mapping
   */
  @Get('range')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
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
   * Get reservations by user ID
   * GET /reservations/user/:userId
   * DECLARATIVE: Filtered query by user
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<ReservationResponseDto[]> {
    return this.reservationService.getMyReservations(userId);
  }

  /**
   * Check availability for a time slot
   * GET /reservations/availability/check?date=15/12/2024&startTime=19:00&endTime=21:00&partySize=4
   * DECLARATIVE: Availability query
   */
  @Get('availability/check')
  @HttpCode(HttpStatus.OK)
  async getTableAvailability(
    @Query('date') dateStr: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('partySize') partySizeStr: string,
  ): Promise<any> {
    // Validate parameters
    if (!dateStr || !startTime || !endTime || !partySizeStr) {
      throw new BadRequestException(
        'date, startTime, endTime, and partySize query parameters are required',
      );
    }

    // Validate DD/MM/YYYY format
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!datePattern.test(dateStr)) {
      throw new BadRequestException(
        'Invalid date format. Use DD/MM/YYYY format (e.g., 15/12/2025)',
      );
    }

    const partySize = parseInt(partySizeStr, 10);
    if (isNaN(partySize) || partySize < 1 || partySize > 20) {
      throw new BadRequestException(
        'partySize must be a number between 1 and 20',
      );
    }

    return this.reservationService.getTableAvailability(dateStr, startTime, endTime, partySize);
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
   * Update a reservation
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
   * Cancel a reservation
   * PUT /reservations/:id/cancel
   * IMPERATIVE: Status change operation
   */
  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ReservationResponseDto> {
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    return this.reservationService.cancel(id, userId, userRole);
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
