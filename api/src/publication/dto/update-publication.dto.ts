import { PartialType } from '@nestjs/mapped-types';
import { CreatePublicationDto } from './create-publication.dto';
import { Transform } from 'class-transformer';

export class UpdatePublicationDto extends PartialType(CreatePublicationDto) {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  ids_images?: number[];
}
