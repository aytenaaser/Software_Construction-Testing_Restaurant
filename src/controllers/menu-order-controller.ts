import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { MenuOrderService } from '../services/menu-order.service';
import {
  CreateMenuOrderDto,
  UpdateMenuOrderDto,
  MenuOrderResponseDto,
  UpdateOrderStatusDto,
} from '../dto/menu-order-dto';
import { JwtAuthGuard } from '../auth/guards/authentication-guard';
import { RolesGuard } from '../auth/guards/authorization-guard';
import { Roles } from '../auth/decorators/roles-decorator';
import { UserRole } from '../models/user.schema';

/**
 * Menu Order Controller
 *
 * Handles pre-order endpoints
 * User Story: "As a customer, I want to pre-order my meal"
 */
@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuOrderController {
  constructor(private readonly menuOrderService: MenuOrderService) {}

  /**
   * Create pre-order for a reservation
   * POST /reservations/:id/pre-order
   */
  @Post(':id/pre-order')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('id') reservationId: string,
    @Body() createMenuOrderDto: CreateMenuOrderDto,
    @Request() req: any,
  ): Promise<MenuOrderResponseDto> {
    const userId = req.user?.sub;
    return this.menuOrderService.create(reservationId, userId, createMenuOrderDto);
  }

  /**
   * Get pre-order for a reservation
   * GET /reservations/:id/pre-order
   */
  @Get(':id/pre-order')
  @HttpCode(HttpStatus.OK)
  async findByReservation(
    @Param('id') reservationId: string,
    @Request() req: any,
  ): Promise<MenuOrderResponseDto> {
    const userId = req.user?.sub;
    return this.menuOrderService.findByReservation(reservationId, userId);
  }

  /**
   * Update pre-order
   * PUT /reservations/:id/pre-order
   */
  @Put(':id/pre-order')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') reservationId: string,
    @Body() updateMenuOrderDto: UpdateMenuOrderDto,
    @Request() req: any,
  ): Promise<MenuOrderResponseDto> {
    const userId = req.user?.sub;
    return this.menuOrderService.update(reservationId, userId, updateMenuOrderDto);
  }

  /**
   * Cancel pre-order
   * DELETE /reservations/:id/pre-order
   */
  @Delete(':id/pre-order')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id') reservationId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const userId = req.user?.sub;
    return this.menuOrderService.cancel(reservationId, userId);
  }
}

/**
 * Menu Order Management Controller (Staff/Admin)
 */
@Controller('menu-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuOrderManagementController {
  constructor(private readonly menuOrderService: MenuOrderService) {}

  /**
   * Get today's orders (Staff/Admin)
   * GET /menu-orders/today
   */
  @Get('today')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  async getTodayOrders(): Promise<MenuOrderResponseDto[]> {
    return this.menuOrderService.getTodayOrders();
  }

  /**
   * Update order status (Staff/Admin)
   * PUT /menu-orders/:id/status
   */
  @Put(':id/status')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') orderId: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ): Promise<MenuOrderResponseDto> {
    return this.menuOrderService.updateStatus(orderId, updateStatusDto);
  }
}

