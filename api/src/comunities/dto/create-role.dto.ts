import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CommunityRoles } from 'src/enums/enum.communities.roles';

export class createRoleDto {
  @ApiProperty({
    description: 'create role community',
    example: 'admingroup, membergroup, helpergroup',
  })
  @IsEnum(CommunityRoles)
  @IsNotEmpty()
  role!: CommunityRoles;
}
