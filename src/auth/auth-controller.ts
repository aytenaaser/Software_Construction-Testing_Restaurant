/**
 * Authentication Controller
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles HTTP request/response for authentication
 * - Open/Closed: Can add new endpoints without modifying existing ones
 * - Dependency Inversion: Depends on AuthService abstraction
 *
 * Responsibilities:
 * - HTTP request handling for auth endpoints
 * - Route definition with decorators
 * - Public/protected route management with @Public decorator
 * - Cookie management for JWT tokens
 * - Delegate all business logic to AuthService
 *
 * Programming Paradigms:
 * - DECLARATIVE: Route decorators (@Post, @Get, @Public, @UseGuards)
 * - IMPERATIVE: Request handlers call service methods
 */
import {
    Controller,
    Post,
    Body,
    Get,
    HttpCode,
    HttpStatus,
    Req,
    Res,
    UseGuards,
    InternalServerErrorException,
    Param,
} from '@nestjs/common';
import express from 'express';

import {
    ApiBearerAuth,
    ApiTags,
} from '@nestjs/swagger';
import {Public} from "./decorators/public-decorator";
import {AuthService} from "./auth-service";
import {JwtAuthGuard} from "./guards/authentication-guard";
import {ForgotPasswordDto} from "./dto/forgot-password-dto";
import {LoginDto} from "./dto/login";
import {CreateUserDto} from "../dto/user-dto";


@ApiTags('auth')
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {
    }

    /**
     * IMPERATIVE: Register new user
     * Public endpoint - no authentication required
     */
    @Public()
    @Post('register')
    async register(@Body() dto: CreateUserDto) {
        try {
            return await this.auth.register(dto);
        } catch (e: any) {
            console.error('Registration error:', e?.message ?? String(e), e?.stack);
            throw e;
        }
    }


    /**
     * DECLARATIVE: Get OTP status
     * Public endpoint
     */
    @Public()
    @Get('otp-status/:email')
    async otpStatus(@Param('email') email: string) {
        return this.auth.checkOTPStatus(email);
    }

    /**
     * IMPERATIVE: Resend OTP with rate limiting
     * Public endpoint
     */
    @Public()
    @Post('resend-otp')
    async resendOTP(@Body('email') email: string) {
        await this.auth.resendOTP(email);
        return {message: 'OTP resent successfully'};
    }

    /**
     * IMPERATIVE: Verify OTP code
     * Public endpoint
     */
    @Public()
    @Post('verify-otp')
    async verifyOTP(@Body('email') email: string, @Body('otp') otpCode: string) {
        const res = await this.auth.verifyOTP(email, otpCode);
        return {message: 'Email verified successfully', ...res};
    }

    /**
     * IMPERATIVE: Login user
     * Public endpoint - sets JWT cookie
     */
    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() dto: LoginDto, @Res({passthrough: true}) res: express.Response) {
        const result = await this.auth.login(dto.email, dto.password);
        const cookie = await this.auth.getCookieWithJwtToken(result.access_token);
        res.setHeader('Set-Cookie', cookie);
        return {message: 'Login successful', user: result.user};
    }


    /**
     * IMPERATIVE: Logout user
     * Protected endpoint - requires authentication
     * Blacklists token and clears cookie
     */
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(@Req() req: any, @Res({passthrough: true}) res: express.Response) {
        const token = req.cookies?.access_token;
        if (token) {
            await this.auth.logout(token);
        }
        const cookie = await this.auth.getCookieForLogout();
        res.setHeader('Set-Cookie', cookie);
        return { message: 'Logout successful' };
    }



    /**
     * IMPERATIVE: Initiate password reset
     * Public endpoint - sends OTP
     */
    @Public()
    @Post('forgot-password')
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        await this.auth.forgotPassword(dto.email);
        return { message: 'OTP sent to email' };
    }

    /**
     * IMPERATIVE: Reset password with OTP
     * Public endpoint
     */
    @Public()
    @Post('reset-password')
    async resetPassword(@Body('email') email: string, @Body('otpCode') otpCode: string, @Body('newPassword') newPassword: string) {
        await this.auth.resetPassword(email, otpCode, newPassword);
        return { message: 'Password reset successful' };
    }


}