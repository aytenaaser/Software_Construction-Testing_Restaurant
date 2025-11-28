/**
 * JWT Authentication Guard
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles JWT authentication verification
 * - Open/Closed: Extends NestJS AuthGuard, can be extended without modification
 * - Dependency Inversion: Depends on AuthService and Reflector abstractions
 *
 * Responsibilities:
 * - Verify JWT token validity
 * - Check token blacklist status
 * - Allow public routes to bypass authentication
 * - Extract and validate user from token
 *
 * Programming Paradigms:
 * - IMPERATIVE: Step-by-step authentication checks
 * - DECLARATIVE: Uses decorators and metadata reflection
 */
import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public-decorator';
import {AuthService} from "../auth-service";


@Injectable()
export class JwtAuthGuard extends NestAuthGuard('jwt') {
    constructor(
        private readonly reflector: Reflector,
        private readonly auth: AuthService,
    ) {
        super();
    }

    /**
     * IMPERATIVE STYLE: Step-by-step authentication validation
     * 1. Check if route is public
     * 2. Verify JWT token
     * 3. Check token blacklist
     * 4. Allow or deny access
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Allow @Public routes
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        try {
            await super.canActivate(context);
        } catch (err) {
            throw err;
        }

        // Token exists & valid at this point
        const req = context.switchToHttp().getRequest<Request>();
        const user = (req as any).user;

        if (!user) {
            throw new UnauthorizedException('Unauthorized');
        }

        const token = (req as any).cookies?.access_token;
        if (!token) throw new UnauthorizedException('Missing authentication token');

        const isBlacklisted = await this.auth.isAccessTokenBlacklisted(token);
        if (isBlacklisted) {
            throw new UnauthorizedException('Session expired. Please sign in again.');
        }

        return true;
    }
}