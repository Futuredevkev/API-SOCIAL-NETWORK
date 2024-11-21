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
  latitude: number; 

  @IsNotEmpty()
  @IsNumber()
  longitude: number; 
}
