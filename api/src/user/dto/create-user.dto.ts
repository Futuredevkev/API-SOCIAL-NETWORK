import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'email user',
    example: 'hackapa@outlook.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'lastname user',
    example: 'hackapa',
  })
  @IsString()
  @Length(1, 50)
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({
    description: 'name user',
    example: 'hackapa',
  })
  @IsString()
  @Length(1, 50)
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'password user',
    example: '****',
  })
  @IsString()
  @Length(8, 20)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'phone number user',
    example: '1234567890',
  })
  @IsNumberString()
  @IsNotEmpty()
  phoneNumber?: string;

  @ApiProperty({
    description: 'birthdate user',
    example: '2023-01-01',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  birthdate: Date;
}
