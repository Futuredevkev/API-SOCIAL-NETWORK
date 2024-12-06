import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export class CreateChatDto {
  @ApiProperty({
    description: 'content chat',
    example: 'hello world',
  })
  @IsString()
  content: string;
}
