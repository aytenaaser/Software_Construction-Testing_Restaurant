import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';


async function bootstrap() {

    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    app.enableCors({
        origin: ['http://localhost:3999', 'http://localhost:3000', 'http://localhost:5000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    const config = new DocumentBuilder()
        .setTitle('Restaurant Reservation System API')
        .setDescription(`
            Complete API documentation for Restaurant Reservation System
            
            Features:
            - Authentication with email verification
            - Reservation management with email notifications
            - Menu browsing and management
            - Pre-order system
            - Feedback and ratings
            - Table management
            - User management
            
            Note: Most endpoints require authentication. Use /auth/login to get your token.
            Then click "Authorize" button and paste the token (without "Bearer" prefix).
        `)
        .setVersion('1.0')
        .setContact('Restaurant Team', 'https://restaurant.com', 'support@restaurant.com')
        .addTag('Authentication', 'User registration, login, and password management')
        .addTag('Reservations', 'Create and manage table reservations')
        .addTag('Menu', 'Browse and manage menu items')
        .addTag('Pre-orders', 'Pre-order menu items with reservations')
        .addTag('Feedback', 'Customer feedback and ratings')
        .addTag('Tables', 'Table management and availability')
        .addTag('Users', 'User account management')
        .addTag('Payments', 'Payment processing')
        .addCookieAuth('access_token', {
            type: 'apiKey',
            in: 'cookie',
            name: 'access_token',
        })
        .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            in: 'header',
        }, 'JWT')
        .build();

    const document = SwaggerModule.createDocument(app, config, {});

    SwaggerModule.setup('api', app, document);

    const port = Number(process.env.PORT) || 8000;

    await app.listen(port);

    console.log(`Application running on http://localhost:${port}`);

    console.log(`Swagger running on http://localhost:${port}/api`);
}
bootstrap()