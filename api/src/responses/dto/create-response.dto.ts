import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateResponseDto {
  @ApiProperty({
    description: 'content response',
    example: 'content response',
  })
  @IsString()
  @MaxLength(1000)
  @MinLength(3)
  @IsNotEmpty()
  content: string;

  parentResponseId?: string;
}
