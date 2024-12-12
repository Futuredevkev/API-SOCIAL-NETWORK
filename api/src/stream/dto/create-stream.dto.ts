import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateStreamDto {
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    description: 'title stream',
    example: 'title',
  })
  title: string;

  @ApiProperty({
    description: 'description stream',
    example: 'description',
  })
  @MaxLength(1000)
  description: string;
}
