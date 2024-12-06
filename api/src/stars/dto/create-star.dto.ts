import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateStarDto {
  @ApiProperty({
    description: 'stars number',
    example: 5,
  })
  @IsNumber({ allowNaN: false })
  @IsPositive()
  @IsNotEmpty()
  stars: number;
}
