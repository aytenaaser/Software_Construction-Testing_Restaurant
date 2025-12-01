import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
    })
    @IsEmail()
    email!: string;

    @ApiProperty({
        description: 'User password',
        example: 'Password123',
        minLength: 6,
    })
    @IsNotEmpty()
    @MinLength(6)
    password!: string;
}