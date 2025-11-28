/**
 * Role-Based Authorization Guard
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles role-based authorization
 * - Open/Closed: Can be extended with new role checks without modification
 * - Interface Segregation: Implements minimal CanActivate interface
 * - Dependency Inversion: Depends on Reflector abstraction
 *
 * Responsibilities:
 * - Check if user has required role(s) for the route
 * - Use metadata reflection to get required roles from @Roles decorator
 * - Allow access if no roles specified (public route)
 *
 * Programming Paradigms:
 * - DECLARATIVE: Uses metadata reflection and decorators
 * - IMPERATIVE: Step-by-step role validation
 */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {UserRole} from "../../models/user.schema";
import {ROLES_KEY} from "../decorators/roles-decorator";



@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    /**
     * DECLARATIVE STYLE: Role-based access control
     * Uses metadata reflection to check required roles
     */
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!requiredRoles) return true;

        const req = context.switchToHttp().getRequest();
        const user = req.user as { role?: UserRole } | undefined;
        return !!user?.role && requiredRoles.includes(user.role);
    }
}