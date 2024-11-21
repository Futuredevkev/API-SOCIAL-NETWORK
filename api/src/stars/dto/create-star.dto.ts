import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateStarDto {
  @IsNumber({ allowNaN: false })
  @IsPositive()
  @IsNotEmpty()
  stars: number;
}
