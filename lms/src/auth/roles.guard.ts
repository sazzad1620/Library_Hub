import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check roles from method-level and class-level
    const requiredRoles =
      this.reflector.get<Role[]>('roles', context.getHandler()) ||
      this.reflector.get<Role[]>('roles', context.getClass());

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Unauthorized: You must be logged in');
    }

    if (!requiredRoles) {
      return true; // If no roles are specified, allow access
    }

    // Check if user's role matches any required role
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new UnauthorizedException(
        'Unauthorized: You do not have access to this resource',
      );
    }

    return true;
  }
}
