import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(1, 50)
  @IsNotEmpty()
  lastname: string;

  @IsString()
  @Length(1, 50)
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(8, 20)
  @IsNotEmpty()
  password: string;

  @IsNumberString()
  @IsNotEmpty()
  phoneNumber?: string;

  @Type(() => Date)
  @IsNotEmpty()
  birthdate: Date;
}
