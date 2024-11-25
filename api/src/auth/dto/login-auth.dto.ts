import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

export class FaceEncodingDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  encoding: number[];
}

export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(8, 20)
  @IsNotEmpty()
  password: string;

  @IsObject()
  @ValidateNested()
  @Type(() => FaceEncodingDto)
  face_encoding?: FaceEncodingDto;
}
