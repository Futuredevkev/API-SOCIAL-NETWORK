import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class BasePublicationDto {
  @ApiProperty({
    description: 'title publication',
    example: 'title publication',
  })
  @IsString()
  @MaxLength(150)
  title?: string;

  @ApiProperty({
    description: 'description publication',
    example: 'description publication',
  })
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'latitude publication',
    example: '30000',
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'longitude publication',
    example: '40000',
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'communityId publication',
    example: 'communityId publication',
  })
  @IsOptional()
  communityId?: string;
}
