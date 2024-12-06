import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'order token',
    example: 'order token',
  })
  @IsString()
  @IsOptional()
  token?: string;

  @ApiProperty({
    description: 'order amount',
    example: 'order amount',
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @IsOptional()
  amount?: number;

  @ApiProperty({
    description: 'order description',
    example: 'order description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'order email',
    example: 'order email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'order status',
    example: 'APPROVED',
  })
  @IsEnum(StatusPay)
  @IsOptional()
  status?: StatusPay;

  @ApiProperty({
    description: 'order method',
    example: 'mercadopago or paypal',
  })
  @IsEnum(MethodPays)
  @IsNotEmpty()
  method: MethodPays;
}
