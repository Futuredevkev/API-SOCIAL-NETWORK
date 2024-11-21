import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateResponseDto {
  @IsString()
  @MaxLength(700)
  @MinLength(3)
  @IsNotEmpty()
  content: string;
}
