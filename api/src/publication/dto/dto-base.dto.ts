import { IsOptional, IsString, MaxLength } from 'class-validator';

export class BasePublicationDto {
  @IsString()
  @MaxLength(150)
  title?: string;

  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  communityId?: string;
}
