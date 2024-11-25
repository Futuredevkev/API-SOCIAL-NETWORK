import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateAddressDto {
  @IsOptional()
  city?: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  latitude: number; 

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  longitude: number; 
}
