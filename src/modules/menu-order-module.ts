import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuOrder, MenuOrderSchema } from '../models/MenuOrder.schema';
import { MenuItem, MenuItemSchema } from '../models/MenuItem.schema';
import { Reservation, ReservationSchema } from '../models/Reservation.schema';
import { MenuOrderService } from '../services/menu-order.service';
import { MenuOrderController, MenuOrderManagementController } from '../controllers/menu-order-controller';
import { MenuModule } from './menu-module';
import { AuthModule } from '../auth/auth-module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuOrder.name, schema: MenuOrderSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Reservation.name, schema: ReservationSchema },
    ]),
    MenuModule, // Import MenuModule to use MenuService
    AuthModule, // Import AuthModule for authentication guards
  ],
  controllers: [MenuOrderController, MenuOrderManagementController],
  providers: [MenuOrderService],
  exports: [MenuOrderService],
})
export class MenuOrderModule {}

