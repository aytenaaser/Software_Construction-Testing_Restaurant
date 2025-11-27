// src/modules/users/users.module.ts
import {forwardRef, Module} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {UsersController} from "../controllers/user-controller";
import {User, UserSchema} from "../models/user.schema";
import {UsersService} from "../services/user.service";
import {AuthModule} from "../auth/auth-module";


@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
       forwardRef(() => AuthModule),
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}