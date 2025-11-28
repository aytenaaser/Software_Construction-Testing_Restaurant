import {
    Injectable,
    UnauthorizedException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {UserRole} from "../models/user.schema";
import {BlacklistedToken, BlackListedTokenDocument} from "./token/blacklist-token";
import {MailService} from "./email/email-service";
import {CreateUserDto} from "../dto/user-dto";
import {UsersService} from "../services/user.service";


/**
 * Authentication Service
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles authentication and authorization logic
 * - Open/Closed: Can be extended with new auth strategies without modifying existing code
 * - Liskov Substitution: Uses service interfaces and abstractions
 * - Interface Segregation: Depends on focused services (UsersService, JwtService, MailService)
 * - Dependency Inversion: Depends on service abstractions, not concrete implementations
 *
 * Programming Paradigms:
 * - Imperative: Step-by-step auth operations (register, login, logout)
 * - Declarative: Pure transformation functions (toSafeUser), Promise chains
 *
 * Security Features:
 * - Password hashing with bcrypt
 * - JWT token management
 * - Token blacklisting for logout
 * - Email verification with OTP
 * - Password reset with OTP
 */

type SafeUser = {
    _id: string;
    email: string;
    role: UserRole;
    isEmailVerified: boolean;

};

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
        @InjectModel(BlacklistedToken.name) private readonly blacklistModel: Model<BlackListedTokenDocument>,
        private readonly mail: MailService,
    ) {}

    /**
     * DECLARATIVE HELPER: Transform user document to safe user object
     * Pure function with no side effects
     */
    private toSafeUser(doc: any): SafeUser {
        const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
        return {
            _id: String(obj._id),
            email: obj.email,
            role: obj.role,
            isEmailVerified: !!obj.isEmailVerified,

        };
    }


    /**
     * IMPERATIVE STYLE: Register new user
     * Step-by-step user creation with OTP generation and email sending
     */
    async register(dto: CreateUserDto) {
        const existing = await this.userService.findByEmailOptional(dto.email);

        if (existing) throw new UnauthorizedException('Email already in use');

        const newUser = await this.userService.create(dto);

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.userService.updateUserInternal(String((newUser as any)._id), {
            isEmailVerified: false,
            otpCode,
            otpExpiresAt,
        });

        try {
            await this.mail.sendVerificationEmail(newUser.email, otpCode);
        } catch (e: any) {
            // Email sending failed - log to console
            console.error('Failed to send verification email:', e?.message ?? String(e));
        }

        return {
            message: 'Registered. Verify email via OTP.',
            //user: this.toSafeUser(newUser),
            //user:dto,
            //user: {id: newUser._id, email: newUser.email, role: newUser.role},
            newUser,
        };
    }

    /**
     * IMPERATIVE STYLE: Verify OTP code
     * Step-by-step validation and user update
     */
    async verifyOTP(email: string, otpCode: string) {

        const user = await this.userService.findByEmail(email);

        if (!user) throw new NotFoundException('User not found');


        if (!user.otpCode || !user.otpExpiresAt || user.otpCode !== otpCode || new Date() > user.otpExpiresAt) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        await this.userService.updateUserInternal((user as any)._id.toString(), {
            isEmailVerified: true,
            otpCode: null,
            otpExpiresAt: null,
        });

        await this.mail.VerifiedEmail(user.email,'Your email has been successfully verified. You can now log in to your account.');


        return { user: {id: (user as any)._id, email: user.email, role: user.role}};
    }



    /**
     * IMPERATIVE STYLE: Validate user credentials
     * Step-by-step password verification
     */
    async validateUser(email: string, plainPassword: string): Promise<SafeUser> {
        const user = await this.userService.findByEmailWithHash(email);

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const ok = await bcrypt.compare(plainPassword, user.password);
        if (!ok) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.toSafeUser(user);
    }

    /**
     * IMPERATIVE STYLE: Login user
     * Step-by-step validation and JWT generation
     */
    async login(email: string, plainPassword: string) {
        const user = await this.validateUser(email, plainPassword);

        if (!user.isEmailVerified) throw new UnauthorizedException('Email not verified');

        const payload = { sub: user._id, email: user.email, role: user.role };
        const access_token = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

        return { access_token, user };
    }

    /**
     * DECLARATIVE HELPER: Generate JWT cookie string
     * Pure function
     */
    async getCookieWithJwtToken(token: string) {
        return `access_token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }

    /**
     * DECLARATIVE HELPER: Generate logout cookie string
     * Pure function
     */
    async getCookieForLogout() {
        return `access_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
    }



    /**
     * IMPERATIVE STYLE: Logout user by blacklisting token
     * Step-by-step token verification and blacklisting
     */
    async logout(token: string) {
        if (!token) throw new BadRequestException('No token provided');

        // verify signature & expiry (trusted)
        let decoded: any;
        try {
            decoded = await this.jwtService.verifyAsync(token);
        } catch {
            // invalid or already expired -> no-op (logout success)
            return { message: 'Logout successful' };
        }

        try {
            await this.blacklistModel.create({
                token,
                expiresAt: new Date(decoded.exp * 1000),
            });
        } catch (err: any) {
            if (err.code !== 11000) throw err; // ignore duplicate-key
        }

        return { message: 'Logout successful' };
    }


    /**
     * DECLARATIVE STYLE: Check if token is blacklisted
     * Functional query returning boolean
     */
    async isAccessTokenBlacklisted(token: string) {
        const hit = await this.blacklistModel.findOne({ token }).select('_id').lean();
        return !!hit;
    }

    /**
     * IMPERATIVE STYLE: Generic OTP sender with rate limiting
     * Step-by-step OTP generation and email sending
     * Follows DRY principle by consolidating OTP logic
     */
    private async sendOtpGeneric(email: string, purpose: 'verification' | 'password-reset' | 'login', rateLimit: boolean,): Promise<void> {

        const user = await this.userService.findByEmail(email);

        if (!user) throw new NotFoundException('User not found');

        if (purpose === 'verification' && user.isEmailVerified) {
            throw new BadRequestException('Email is already verified');
        }

        // determine last expiry field depending on purpose
        const lastExpiry = purpose === 'password-reset' ? user.passwordResetOtpExpiresAt ?? null : user.otpExpiresAt ?? null;

        if (rateLimit && lastExpiry && Date.now() - lastExpiry.getTime() < 2 * 60 * 1000) {
            throw new BadRequestException('Please wait before requesting a new OTP');
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        if (purpose === 'password-reset') {
            await this.userService.updateUserInternal(String((user as any)._id), {
                passwordResetOtpCode: otpCode,
                passwordResetOtpExpiresAt: otpExpiresAt,
            });
        } else {
            await this.userService.updateUserInternal(String((user as any)._id), {
                otpCode,
                otpExpiresAt,
            });
        }

        try {
            if (purpose === 'verification') {
                await this.mail.sendVerificationEmail(user.email!, otpCode);
            } else if (purpose === 'password-reset') {
                await this.mail.sendPasswordResetEmail(user.email!, otpCode);
            } else {
                await this.mail.sendVerificationEmail(user.email!, otpCode); // reuse template for login OTP
            }
        } catch (err: any) {
            console.error('Failed to send OTP email:', err?.message ?? String(err));
        }
    }

    /**
     * IMPERATIVE STYLE: Send OTP for verification
     * Delegates to generic OTP sender
     */
    async sendOTP(email: string): Promise<{ message: string }> {
        await this.sendOtpGeneric(email, 'verification', false);
        return { message: 'OTP sent to email' };
    }

    /**
     * IMPERATIVE STYLE: Resend OTP with rate limiting
     * Delegates to generic OTP sender with rate limiting enabled
     */
    async resendOTP(email: string): Promise<{ message: string }> {
        await this.sendOtpGeneric(email, 'verification', true);
        return { message: 'OTP resent successfully' };
    }

    /**
     * DECLARATIVE STYLE: Check OTP validity status
     * Functional validation returning status object
     */
    async checkOTPStatus(email: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) throw new NotFoundException('User not found');
        const now = new Date();
        const valid = !!(user.otpCode && user.otpExpiresAt && now < user.otpExpiresAt);
        return { valid, expiresAt: user.otpExpiresAt ?? undefined };
    }

    /**
     * IMPERATIVE STYLE: Initiate password reset
     * Sends OTP for password reset
     */
    async forgotPassword(email: string): Promise<{ message: string }> {
        await this.sendOtpGeneric(email, 'password-reset', false);
        return { message: 'Password reset OTP sent to email' };
    }

    /**
     * IMPERATIVE STYLE: Reset password with OTP
     * Step-by-step OTP validation and password update
     */
    async resetPassword(email: string, otpCode: string, newPassword: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) throw new NotFoundException('User not found');

        if (
            !user.passwordResetOtpCode ||
            !user.passwordResetOtpExpiresAt ||
            user.passwordResetOtpCode !== otpCode ||
            new Date() > user.passwordResetOtpExpiresAt
        ) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        const password = await bcrypt.hash(newPassword, 10);

        await this.userService.updateUserInternal((user as any)._id.toString(), {
            password,
            passwordResetOtpCode: null,
            passwordResetOtpExpiresAt: null,
        });

        return { message: 'Password changed' };
    }


}
