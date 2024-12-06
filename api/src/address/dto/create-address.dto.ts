import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    description: 'City',
    example: 'Uruguay',
  })
  @IsOptional()
  @MaxLength(200)
  city?: string;

  @ApiProperty({
    description: 'Latitude',
    example: '-30000',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  latitude: number;

  @ApiProperty({
    description: 'Longitude',
    example: '40000',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  longitude: number;
}
