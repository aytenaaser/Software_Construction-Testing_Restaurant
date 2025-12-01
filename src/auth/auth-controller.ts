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
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
} from '@nestjs/swagger';
import {Public} from "./decorators/public-decorator";
import {AuthService} from "./auth-service";
import {JwtAuthGuard} from "./guards/authentication-guard";
import {ForgotPasswordDto} from "./dto/forgot-password-dto";
import {LoginDto} from "./dto/login";
import {CreateUserDto} from "../dto/user-dto";


@ApiTags('Authentication')
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
    @ApiOperation({
        summary: 'Register new user',
        description: 'Create a new user account. Email verification with OTP is required after registration.'
    })
    @ApiResponse({ status: 201, description: 'User registered successfully. OTP sent to email.' })
    @ApiResponse({ status: 400, description: 'Invalid input or user already exists.' })
    @ApiBody({ type: CreateUserDto })
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
    @ApiOperation({
        summary: 'Check OTP status',
        description: 'Check if OTP exists and is still valid for a given email.'
    })
    @ApiParam({ name: 'email', description: 'User email address', example: 'user@example.com' })
    @ApiResponse({ status: 200, description: 'OTP status retrieved.' })
    @ApiResponse({ status: 404, description: 'No OTP found for this email.' })
    async otpStatus(@Param('email') email: string) {
        return this.auth.checkOTPStatus(email);
    }

    /**
     * IMPERATIVE: Resend OTP with rate limiting
     * Public endpoint
     */
    @Public()
    @Post('resend-otp')
    @ApiOperation({
        summary: 'Resend OTP code',
        description: 'Resend verification OTP to user email. Rate limited to prevent abuse.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'OTP resent successfully.' })
    @ApiResponse({ status: 429, description: 'Too many requests. Please wait before requesting again.' })
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
    @ApiOperation({
        summary: 'Verify OTP code',
        description: 'Verify email using the OTP code sent to user email.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
                otp: { type: 'string', example: '123456', description: '6-digit OTP code' }
            },
            required: ['email', 'otp']
        }
    })
    @ApiResponse({ status: 200, description: 'Email verified successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid or expired OTP code.' })
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
    @ApiOperation({
        summary: 'User login',
        description: 'Authenticate user and receive JWT token. Email must be verified first.'
    })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Login successful. JWT token returned in response body and set in cookie.' })
    @ApiResponse({ status: 401, description: 'Invalid credentials or email not verified.' })
    async login(@Body() dto: LoginDto, @Res({passthrough: true}) res: express.Response) {
        const result = await this.auth.login(dto.email, dto.password);
        const cookie = await this.auth.getCookieWithJwtToken(result.access_token);
        res.setHeader('Set-Cookie', cookie);
        return {
            message: 'Login successful',
            access_token: result.access_token,
            user: result.user
        };
    }


    /**
     * IMPERATIVE: Logout user
     * Protected endpoint - requires authentication
     * Blacklists token and clears cookie
     */
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    @ApiBearerAuth('JWT')
    @ApiOperation({
        summary: 'User logout',
        description: 'Logout user, blacklist token, and clear authentication cookie. Requires authentication.'
    })
    @ApiResponse({ status: 200, description: 'Logout successful.' })
    @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token.' })
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
    @ApiOperation({
        summary: 'Forgot password',
        description: 'Request password reset. Sends OTP code to user email.'
    })
    @ApiBody({ type: ForgotPasswordDto })
    @ApiResponse({ status: 200, description: 'OTP sent to email successfully.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
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
    @ApiOperation({
        summary: 'Reset password',
        description: 'Reset password using OTP code received via email.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
                otpCode: { type: 'string', example: '123456', description: '6-digit OTP code' },
                newPassword: { type: 'string', example: 'newPassword123', minLength: 6 }
            },
            required: ['email', 'otpCode', 'newPassword']
        }
    })
    @ApiResponse({ status: 200, description: 'Password reset successful.' })
    @ApiResponse({ status: 400, description: 'Invalid or expired OTP code.' })
    async resetPassword(@Body('email') email: string, @Body('otpCode') otpCode: string, @Body('newPassword') newPassword: string) {
        await this.auth.resetPassword(email, otpCode, newPassword);
        return { message: 'Password reset successful' };
    }


}