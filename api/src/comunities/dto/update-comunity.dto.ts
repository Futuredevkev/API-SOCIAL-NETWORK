import { PartialType } from '@nestjs/mapped-types';
import { CreateComunityDto } from './create-comunity.dto';

export class UpdateComunityDto extends PartialType(CreateComunityDto) {}
