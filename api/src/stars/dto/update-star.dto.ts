import { PartialType } from '@nestjs/mapped-types';
import { CreateStarDto } from './create-star.dto';

export class UpdateStarDto extends PartialType(CreateStarDto) {}
