import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from "./auth/auth-module";
import { UsersModule } from "./modules/user-module";
import { ReservationModule } from "./modules/reservation-module";
import { PaymentModule } from "./modules/payment-module";
import { TableModule } from "./modules/table-module";
import { MenuModule } from "./modules/menu-module";
import { MenuOrderModule } from "./modules/menu-order-module";
import { FeedbackModule } from "./modules/feedback-module";
import { AdminController } from './controllers/admin.controller';

import { FeedbackController } from './controllers/feedback-controller';
import { MenuController } from './controllers/menu-controller';
import { MenuOrderController } from './controllers/menu-order-controller';
import { PaymentController } from './controllers/payment-controller';
import { ReservationController } from './controllers/reservation-controller';
import { TableController } from './controllers/table-controller';
import { UsersController } from './controllers/user-controller';
import { AuthController } from './auth/auth-controller';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ScheduleModule.forRoot(), // ✅ Enable cron jobs for reminders
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('MONGODB_URI'),
            }),
            inject: [ConfigService],
        }),
        AuthModule,
        UsersModule,
        ReservationModule,
        PaymentModule,
        TableModule,
        MenuModule,           // ✅ NEW: Menu management
        MenuOrderModule,      // ✅ NEW: Pre-order system
        FeedbackModule,       // ✅ NEW: Customer feedback
    ],
    controllers: [
        AdminController,
        AuthController,
        UsersController,
        ReservationController,
        TableController,
        PaymentController,
        MenuController,
        MenuOrderController,
        FeedbackController,
    ],
})
export class AppModule {}