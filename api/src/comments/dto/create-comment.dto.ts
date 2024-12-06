import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'content comment',
    example: 'you are pretty boy',
  })
  @IsString()
  @MaxLength(1000)
  @MinLength(3)
  @IsNotEmpty()
  content: string;
}
