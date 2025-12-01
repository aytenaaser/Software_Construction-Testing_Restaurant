import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {BlacklistedToken, BlacklistedTokenSchema} from "./token/blacklist-token";
import {MongooseModule} from "@nestjs/mongoose";
import {AuthController} from "./auth-controller";
import {AuthService} from "./auth-service";
import {JwtStrategy} from "./token/jwt-strategies";
import {RolesGuard} from "./guards/authorization-guard";
import {JwtAuthGuard} from "./guards/authentication-guard";
import {MailModule} from "./email/email-module";
import {JwtModule, JwtModuleOptions} from "@nestjs/jwt";
import {UsersModule} from "../modules/user-module";



@Module({
    imports: [
        ConfigModule,
        MailModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (cfg: ConfigService): JwtModuleOptions => ({
                secret: cfg.get<string>('JWT_SECRET'),
                //signOptions: { expiresIn: cfg.get<string>('JWT_EXPIRES_IN') || '7d' }, // JwtModule default
            }),
        }),
        MongooseModule.forFeature([{ name: BlacklistedToken.name, schema: BlacklistedTokenSchema }]),
        forwardRef(() => UsersModule),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, RolesGuard, JwtAuthGuard],
    exports: [AuthService, JwtModule, JwtAuthGuard, RolesGuard, MailModule],
})
export class AuthModule {}