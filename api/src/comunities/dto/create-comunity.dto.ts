import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CommunityRoles } from 'src/enums/enum.communities.roles';

export class CreateComunityDto {
  @ApiProperty({
    description: 'title community',
    example: 'joselitos',
  })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'description community',
    example: 'joselitos arriba de la cama',
  })
  @IsString()
  @MaxLength(1000)
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'role community',
    example: 'admingroup, membergroup, helpergroup',
  })
  @IsEnum(CommunityRoles)
  @IsOptional()
  role?: CommunityRoles;
}
