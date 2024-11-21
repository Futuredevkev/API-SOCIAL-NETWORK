import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { categoryTag } from 'src/enums/enum.category';
import { ItemTag } from 'src/enums/enum.tags';
import { BasePublicationDto } from './dto-base.dto';

export class CreatePublicationDto extends BasePublicationDto {
  @IsEnum(ItemTag)
  @IsNotEmpty()
  tag: ItemTag;

  @IsEnum(categoryTag)
  @IsNotEmpty()
  category: categoryTag;
}
