import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsString,
  maxLength,
  MaxLength,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    description: 'title event',
    example: 'hackaton',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    description: 'description event',
    example: 'hackaton',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description!: string;

  @ApiProperty({
    description: 'start date event',
    example: '2023-01-01',
  })
  @IsDate()
  @Type(() => Date)
  start_date!: Date;

  @ApiProperty({
    description: 'end date event',
    example: '2023-01-01',
  })
  @IsDate()
  @Type(() => Date)
  end_date!: Date;

  @ApiProperty({
    description: 'address event',
    example: 'calle 123',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  address!: string;

  @ApiProperty({
    description: 'city event',
    example: 'montevideo',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  city!: string;
}
