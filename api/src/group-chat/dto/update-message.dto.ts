import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional } from 'class-validator';
import { CreateSendMessageDto } from './create-send-message.dto';
import { Transform } from 'class-transformer';

export class UpdateMessageDto extends PartialType(CreateSendMessageDto) {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  ids_images?: number[];
}
