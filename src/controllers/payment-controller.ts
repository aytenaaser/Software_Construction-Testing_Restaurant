/**
 * Payment Controller
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles HTTP request/response for payments
 * - Open/Closed: Can add new endpoints without modifying existing ones
 * - Dependency Inversion: Depends on PaymentService abstraction
 *
 * Responsibilities:
 * - Handle HTTP requests/responses
 * - Route requests to service layer
 * - Validate request format
 * - Apply security guards
 * - Extract user context from JWT
 *
 * Separation of Concerns:
 * - Business logic delegated to service
 * - Validation delegated to DTOs and service
 * - Database operations delegated to service
 *
 * Programming Paradigms:
 * - DECLARATIVE: Route decorators define behavior
 * - IMPERATIVE: Request handlers call service methods
 */

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
import { PaymentService } from '../services/payment.service';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentResponseDto,
  PaymentStatsDto,
} from '../dto/payment-dto';
import { JwtAuthGuard } from '../auth/guards/authentication-guard';
import { RolesGuard } from '../auth/guards/authorization-guard';
import { Roles } from '../auth/decorators/roles-decorator';
import { UserRole } from '../models/user.schema';
import { PaymentStatus } from '../models/payment.schema';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Create a new payment
   * POST /payments
   * IMPERATIVE: Direct call to service with user context
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: any,
  ): Promise<PaymentResponseDto> {
    const customerId = req.user.userId || req.user.sub;
    return this.paymentService.create(createPaymentDto, customerId);
  }

  /**
   * Get all payments
   * GET /payments
   * DECLARATIVE: Composition of database query and mapping
   * Admin/Staff only
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<PaymentResponseDto[]> {
    return this.paymentService.findAll();
  }

  /**
   * Get payment statistics
   * GET /payments/statistics
   * DECLARATIVE: Aggregation query
   * Admin/Staff only
   */
  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  async getStatistics(): Promise<PaymentStatsDto> {
    return this.paymentService.getStatistics();
  }

  /**
   * Get payments by status
   * GET /payments/status/:status
   * DECLARATIVE: Filtered query
   * Admin/Staff only
   */
  @Get('status/:status')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  async findByStatus(@Param('status') status: string): Promise<PaymentResponseDto[]> {
    // Validate status enum
    if (!Object.values(PaymentStatus).includes(status as PaymentStatus)) {
      throw new BadRequestException('Invalid payment status');
    }
    return this.paymentService.findByStatus(status as PaymentStatus);
  }

  /**
   * Get payments by date range
   * GET /payments/range?startDate=2024-12-01&endDate=2024-12-31
   * DECLARATIVE: Query filtering and mapping
   * Admin/Staff only
   */
  @Get('range')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  async findByDateRange(
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
  ): Promise<PaymentResponseDto[]> {
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

    return this.paymentService.findByDateRange(startDate, endDate);
  }

  /**
   * Get payments by reservation ID
   * GET /payments/reservation/:reservationId
   * DECLARATIVE: Filtered query by reservation
   */
  @Get('reservation/:reservationId')
  @HttpCode(HttpStatus.OK)
  async findByReservationId(
    @Param('reservationId') reservationId: string,
  ): Promise<PaymentResponseDto[]> {
    return this.paymentService.findByReservationId(reservationId);
  }

  /**
   * Get current user's payments
   * GET /payments/my-payments
   * DECLARATIVE: Filtered query by user
   */
  @Get('my-payments')
  @HttpCode(HttpStatus.OK)
  async getMyPayments(@Request() req: any): Promise<PaymentResponseDto[]> {
    const customerId = req.user.userId || req.user.sub;
    return this.paymentService.findByCustomerId(customerId);
  }

  /**
   * Get payments by customer ID
   * GET /payments/customer/:customerId
   * DECLARATIVE: Filtered query by customer
   * Admin/Staff only
   */
  @Get('customer/:customerId')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  async findByCustomerId(
    @Param('customerId') customerId: string,
  ): Promise<PaymentResponseDto[]> {
    return this.paymentService.findByCustomerId(customerId);
  }

  /**
   * Get a single payment by ID
   * GET /payments/:id
   * IMPERATIVE: Single resource fetch with error handling
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentService.findById(id);
  }

  /**
   * Complete a payment
   * PUT /payments/:id/complete
   * IMPERATIVE: Manual payment completion
   * Admin/Staff only
   */
  @Put(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  async completePayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentService.completePayment(id);
  }

  /**
   * Mark payment as failed
   * PUT /payments/:id/fail
   * IMPERATIVE: Mark payment as failed
   * Admin/Staff only
   */
  @Put(':id/fail')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  async failPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentService.failPayment(id);
  }

  /**
   * Update a payment
   * PUT /payments/:id
   * IMPERATIVE: Step-by-step update with validation
   * Admin/Staff only
   */
  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.update(id, updatePaymentDto);
  }

  /**
   * Delete a payment
   * DELETE /payments/:id
   * IMPERATIVE: Deletion with validation
   * Admin only
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.paymentService.delete(id);
  }
}

