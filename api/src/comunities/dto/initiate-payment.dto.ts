import { IsEmail, IsEnum, IsNotEmpty } from "class-validator";
import { MethodPays } from "src/enums/enum-method-pay";

export class InitiatePaymentDto {
  @IsNotEmpty()
  @IsEnum(MethodPays)
  method: MethodPays;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
