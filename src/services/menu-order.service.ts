import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MenuOrder, MenuOrderDocument, OrderStatus } from '../models/MenuOrder.schema';
import { MenuItem, MenuItemDocument } from '../models/MenuItem.schema';
import { Reservation, ReservationDocument } from '../models/Reservation.schema';
import { CreateMenuOrderDto, UpdateMenuOrderDto, MenuOrderResponseDto, UpdateOrderStatusDto } from '../dto/menu-order-dto';
import { MenuService } from './menu.service';

/**
 * Menu Order Service
 *
 * Handles pre-order functionality
 * User Story: "As a customer, I want to pre-order my meal"
 */
@Injectable()
export class MenuOrderService {
  constructor(
    @InjectModel(MenuOrder.name)
    private menuOrderModel: Model<MenuOrderDocument>,
    @InjectModel(MenuItem.name)
    private menuItemModel: Model<MenuItemDocument>,
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    private readonly menuService: MenuService,
  ) {}

  /**
   * Create pre-order for a reservation
   */
  async create(
    reservationId: string,
    userId: string,
    createMenuOrderDto: CreateMenuOrderDto,
  ): Promise<MenuOrderResponseDto> {
    // Validate reservation exists and belongs to user
    if (!Types.ObjectId.isValid(reservationId)) {
      throw new BadRequestException('Invalid reservation ID');
    }

    const reservation = await this.reservationModel.findById(reservationId);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.userId.toString() !== userId) {
      throw new ForbiddenException('Not authorized to create pre-order for this reservation');
    }

    // Check if pre-order already exists
    const existing = await this.menuOrderModel.findOne({ reservationId: new Types.ObjectId(reservationId) });
    if (existing) {
      throw new BadRequestException('Pre-order already exists for this reservation');
    }

    // Calculate total and prepare order items
    let totalAmount = 0;
    let estimatedTime = 0;
    const orderItems: any[] = [];

    for (const item of createMenuOrderDto.items) {
      const menuItem = await this.menuItemModel.findById(item.menuItemId);
      if (!menuItem) {
        throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
      }

      if (!menuItem.available) {
        throw new BadRequestException(`Menu item "${menuItem.name}" is currently unavailable`);
      }

      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;
      estimatedTime = Math.max(estimatedTime, menuItem.preparationTime || 0);

      orderItems.push({
        menuItemId: new Types.ObjectId(item.menuItemId),
        menuItemName: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions || undefined,
        allergyNote: item.allergyNote || undefined,
      } as any);

      // Increment order count
      await this.menuService.incrementOrderCount(item.menuItemId);
    }

    // Create menu order
    const menuOrder = new this.menuOrderModel({
      reservationId: new Types.ObjectId(reservationId),
      userId: new Types.ObjectId(userId),
      items: orderItems,
      totalAmount,
      estimatedPreparationTime: estimatedTime,
      specialRequests: createMenuOrderDto.specialRequests,
      dietaryRestrictions: createMenuOrderDto.dietaryRestrictions,
      status: OrderStatus.PENDING,
    });

    const saved = await menuOrder.save();

    // Update reservation with menu order reference
    await this.reservationModel.findByIdAndUpdate(reservationId, {
      menuOrderId: saved._id,
      hasPreOrder: true,
    });

    return this.mapToResponse(saved);
  }

  /**
   * Get pre-order for a reservation
   */
  async findByReservation(reservationId: string, userId: string): Promise<MenuOrderResponseDto> {
    if (!Types.ObjectId.isValid(reservationId)) {
      throw new BadRequestException('Invalid reservation ID');
    }

    const order = await this.menuOrderModel
      .findOne({ reservationId: new Types.ObjectId(reservationId) })
      .lean()
      .exec();

    if (!order) {
      throw new NotFoundException('Pre-order not found for this reservation');
    }

    // Check authorization
    if (order.userId.toString() !== userId) {
      throw new ForbiddenException('Not authorized to view this pre-order');
    }

    return this.mapToResponse(order);
  }

  /**
   * Update pre-order
   */
  async update(
    reservationId: string,
    userId: string,
    updateMenuOrderDto: UpdateMenuOrderDto,
  ): Promise<MenuOrderResponseDto> {
    if (!Types.ObjectId.isValid(reservationId)) {
      throw new BadRequestException('Invalid reservation ID');
    }

    const order = await this.menuOrderModel.findOne({
      reservationId: new Types.ObjectId(reservationId)
    });

    if (!order) {
      throw new NotFoundException('Pre-order not found');
    }

    if (order.userId.toString() !== userId) {
      throw new ForbiddenException('Not authorized to update this pre-order');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Cannot update order after it has been confirmed');
    }

    // Recalculate if items changed
    if (updateMenuOrderDto.items) {
      let totalAmount = 0;
      let estimatedTime = 0;
      const orderItems: any[] = [];

      for (const item of updateMenuOrderDto.items) {
        const menuItem = await this.menuItemModel.findById(item.menuItemId);
        if (!menuItem) {
          throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
        }

        const itemTotal = menuItem.price * item.quantity;
        totalAmount += itemTotal;
        estimatedTime = Math.max(estimatedTime, menuItem.preparationTime || 0);

        orderItems.push({
          menuItemId: new Types.ObjectId(item.menuItemId),
          menuItemName: menuItem.name,
          quantity: item.quantity,
          price: menuItem.price,
          specialInstructions: item.specialInstructions || undefined,
          allergyNote: item.allergyNote || undefined,
        } as any);
      }

      order.items = orderItems;
      order.totalAmount = totalAmount;
      order.estimatedPreparationTime = estimatedTime;
    }

    if (updateMenuOrderDto.specialRequests !== undefined) {
      order.specialRequests = updateMenuOrderDto.specialRequests;
    }

    if (updateMenuOrderDto.dietaryRestrictions !== undefined) {
      order.dietaryRestrictions = updateMenuOrderDto.dietaryRestrictions;
    }

    const updated = await order.save();
    return this.mapToResponse(updated);
  }

  /**
   * Cancel pre-order
   */
  async cancel(reservationId: string, userId: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(reservationId)) {
      throw new BadRequestException('Invalid reservation ID');
    }

    const order = await this.menuOrderModel.findOne({
      reservationId: new Types.ObjectId(reservationId)
    });

    if (!order) {
      throw new NotFoundException('Pre-order not found');
    }

    if (order.userId.toString() !== userId) {
      throw new ForbiddenException('Not authorized to cancel this pre-order');
    }

    order.status = OrderStatus.CANCELLED;
    await order.save();

    // Update reservation
    await this.reservationModel.findByIdAndUpdate(reservationId, {
      hasPreOrder: false,
    });

    return { message: 'Pre-order cancelled successfully' };
  }

  /**
   * Update order status (Staff only)
   */
  async updateStatus(
    orderId: string,
    updateStatusDto: UpdateOrderStatusDto,
  ): Promise<MenuOrderResponseDto> {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('Invalid order ID');
    }

    const order = await this.menuOrderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = updateStatusDto.status as OrderStatus;

    if (updateStatusDto.status === 'confirmed' && !order.confirmedAt) {
      order.confirmedAt = new Date();
    } else if (updateStatusDto.status === 'ready' && !order.preparedAt) {
      order.preparedAt = new Date();
    } else if (updateStatusDto.status === 'served' && !order.servedAt) {
      order.servedAt = new Date();
    }

    const updated = await order.save();
    return this.mapToResponse(updated);
  }

  /**
   * Get today's orders (Staff)
   */
  async getTodayOrders(): Promise<MenuOrderResponseDto[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await this.menuOrderModel
      .find({
        createdAt: { $gte: today, $lt: tomorrow },
        status: { $ne: OrderStatus.CANCELLED },
      })
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    return orders.map(order => this.mapToResponse(order));
  }

  /**
   * Map to response DTO
   */
  private mapToResponse(order: any): MenuOrderResponseDto {
    return {
      id: order._id.toString(),
      reservationId: order.reservationId.toString(),
      userId: order.userId.toString(),
      items: order.items.map((item: any) => ({
        menuItemId: item.menuItemId.toString(),
        menuItemName: item.menuItemName,
        quantity: item.quantity,
        price: item.price,
        specialInstructions: item.specialInstructions,
        allergyNote: item.allergyNote,
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      estimatedPreparationTime: order.estimatedPreparationTime,
      specialRequests: order.specialRequests,
      dietaryRestrictions: order.dietaryRestrictions,
      isPaid: order.isPaid || false,
      confirmedAt: order.confirmedAt,
      preparedAt: order.preparedAt,
      servedAt: order.servedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}

