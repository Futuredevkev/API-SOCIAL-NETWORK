import { IsEnum, IsNotEmpty } from 'class-validator';
import { CommunityRoles } from 'src/enums/enum.communities.roles';

export class createRoleDto {
  @IsEnum(CommunityRoles)
  @IsNotEmpty()
  role!: CommunityRoles;
}
