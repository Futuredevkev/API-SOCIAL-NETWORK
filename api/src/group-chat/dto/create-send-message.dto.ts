import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSendMessageDto {
  @ApiProperty({
    description: 'content message',
    example: 'hello world',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;
}
