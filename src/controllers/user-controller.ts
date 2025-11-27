// src/modules/users/users.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    ParseArrayPipe
} from '@nestjs/common';
import {UsersService} from "../services/user.service";
import {UserRole} from "../models/user.schema";
import {RolesGuard} from "../auth/guards/authorization-guard";
import {AuthGuard} from "@nestjs/passport";
import {Roles} from "../auth/decorators/roles-decorator";

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get('profile')
    async getProfile(@Request() req) {
        return this.usersService.findById(req.user.userId);
    }

    @Put('profile')
    async updateProfile(@Request() req, @Body() updateUserDto: any) {
        return this.usersService.update(req.user.userId, updateUserDto);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    async findAll() {
        return this.usersService.findAll();
    }

    @Get('staff')
    @Roles(UserRole.ADMIN)
    async getStaffMembers() {
        return this.usersService.getStaffMembers();
    }

    @Get('customers')
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    async getCustomers() {
        return this.usersService.getCustomers();
    }

    @Get(':id')
    @Roles(UserRole.ADMIN)
    async findById(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Put(':id/role')
    @Roles(UserRole.ADMIN)
    async updateRole(
        @Param('id') id: string,
        @Body('role') role: UserRole
    ) {
        return this.usersService.updateRole(id, role);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async delete(@Param('id') id: string) {
        return this.usersService.delete(id);
    }
}