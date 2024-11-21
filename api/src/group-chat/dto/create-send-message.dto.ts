import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSendMessageDto {
  @IsString()
  @IsNotEmpty()
  content!: string;
}
