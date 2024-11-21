import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MaxLength(1000)
  @MinLength(3)
  @IsNotEmpty()
  content: string;
}
