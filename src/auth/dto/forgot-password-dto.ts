import {IsEmail, IsString} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com',
    })
    @IsEmail()
    email!: string;
}

export class VerifyOtpDto {
    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com',
    })
    @IsEmail()
    email!: string;

    @ApiProperty({
        description: '6-digit OTP code',
        example: '123456',
    })
    @IsString()
    otpCode!: string;
}

export class ForgotPasswordDto {
    @ApiProperty({
        description: 'User email address to send password reset OTP',
        example: 'user@example.com',
    })
    @IsEmail()
    email!: string;
}