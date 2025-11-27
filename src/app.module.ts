import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {AuthModule} from "./auth/auth-module";
import {UsersModule} from "./modules/user-module";
import {ReservationModule} from "./modules/reservation-module";



@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
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

    ],

})
export class AppModule {}