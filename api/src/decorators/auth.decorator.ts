import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleProtected } from '../decorators/roles.decorator';
import { UserRoleGuard } from '../guards/user-role.guard';
import { Roles } from '../enums/enum.roles';
import { JwtAuthGuard } from 'src/guards/auth.guards';

export function Auth(...roles: Roles[]): MethodDecorator & ClassDecorator {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(JwtAuthGuard, UserRoleGuard),
  );
}
