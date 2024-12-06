import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty } from "class-validator";
import { MethodPays } from "src/enums/enum-method-pay";

export class InitiatePaymentDto {
  @ApiProperty({
    description: 'method payment',
    example: 'paypal or mercadopago',
  })
  @IsNotEmpty()
  @IsEnum(MethodPays)
  method: MethodPays;

  @ApiProperty({
    description: 'email user',
    example: 'hackapa@outlook.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
