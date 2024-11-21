import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { Roles } from '../enums/enum.roles';
import { CommunityRoles } from 'src/enums/enum.communities.roles';

export const META_ROLES = 'roles';

export const RoleProtected = (
  ...args: (Roles | CommunityRoles)[]
): CustomDecorator<string> => {
  return SetMetadata(META_ROLES, args);
};
