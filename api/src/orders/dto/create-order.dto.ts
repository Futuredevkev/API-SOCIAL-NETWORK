import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { MethodPays } from 'src/enums/enum-method-pay';
import { StatusPay } from 'src/enums/enum-status-pay';

export class CreateOrderDto {
  @IsString()
  @IsOptional()
  token?: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEmail()
  email: string;

  @IsEnum(StatusPay)
  @IsOptional()
  status?: StatusPay;

  @IsEnum(MethodPays)
  @IsNotEmpty()
  method: MethodPays;
}
