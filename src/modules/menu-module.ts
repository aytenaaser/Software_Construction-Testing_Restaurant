import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItem, MenuItemSchema } from '../models/MenuItem.schema';
import { MenuService } from '../services/menu.service';
import { MenuController } from '../controllers/menu-controller';
import { AuthModule } from '../auth/auth-module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
    AuthModule, // Import AuthModule for authentication guards
  ],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}

