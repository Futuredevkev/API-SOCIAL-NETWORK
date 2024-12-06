import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGroupChatDto {
  @ApiProperty({
    description: 'name group chat',
    example: 'group chat 1',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'description group chat',
    example: 'group chat 1',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description!: string;
}
