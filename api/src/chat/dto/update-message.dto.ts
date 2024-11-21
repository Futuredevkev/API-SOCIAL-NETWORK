import { PartialType } from '@nestjs/mapped-types';
import { CreateChatDto } from './create-chat.dto';
import { Transform } from 'class-transformer';

export class UpdateMessageDto extends PartialType(CreateChatDto) {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  ids_images?: number[];
}
