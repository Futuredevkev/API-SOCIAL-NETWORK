import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/roles.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    console.log('user', user);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    for (const role of user.role) {
      if (validRoles.includes(role)) {
        console.log('Valid roles:', validRoles);
        return true;
      }
    }

    throw new ForbiddenException(
      `User ${user.name} nee a valid role: [${validRoles.join(', ')}]`,
    );
  }
}
