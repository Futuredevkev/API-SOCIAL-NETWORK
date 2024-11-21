import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGroupChatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description!: string;
}
