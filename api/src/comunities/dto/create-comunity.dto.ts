import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CommunityRoles } from 'src/enums/enum.communities.roles';

export class CreateComunityDto {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  title!: string;

  @IsString()
  @MaxLength(1000)
  @IsNotEmpty()
  description!: string;

  @IsEnum(CommunityRoles)
  @IsOptional()
  role?: CommunityRoles;
}
