import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

export class FaceEncodingDto {
  @ApiProperty({
    description: 'status of faceEncoding',
    example: 'success'
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'enconding face',
    example: '0l403413l41lk430531k510321'
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  encoding: number[];
}

export class LoginUserDto {
  @ApiProperty({
    description: 'email user',
    example: 'hackapa@outlook.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'password user',
    example: '****',
  })
  @IsString()
  @Length(8, 20)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'enconding face save',
    example: '0l403413l41lk430531k510321',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => FaceEncodingDto)
  face_encoding?: FaceEncodingDto;
}
