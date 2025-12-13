import {
    Controller,
    Delete,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/user.service';
import { UserRole } from '../models/user.schema';
import { RolesGuard } from '../auth/guards/authorization-guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles-decorator';

@ApiTags('Admin')
@ApiBearerAuth('JWT')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(private readonly usersService: UsersService) {}

    /**
     * Admin-only endpoint to delete a user by email.
     * This is useful for clearing out test users or unverified accounts.
     */
    @Delete('user/by-email/:email')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: '[Admin] Delete user by email',
        description: 'Allows an admin to delete any user account by providing their email address. This is a hard delete and is irreversible.'
    })
    @ApiResponse({ status: 204, description: 'User deleted successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden. Only admins can perform this action.' })
    @ApiResponse({ status: 404, description: 'User with the specified email not found.' })
    async deleteUserByEmail(@Param('email') email: string): Promise<void> {
        await this.usersService.deleteByEmail(email);
    }
}

