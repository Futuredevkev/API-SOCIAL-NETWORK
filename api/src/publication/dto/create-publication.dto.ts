import { IsEnum, IsNotEmpty} from 'class-validator';
import { categoryTag } from 'src/enums/enum.category';
import { ItemTag } from 'src/enums/enum.tags';
import { BasePublicationDto } from './dto-base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePublicationDto extends BasePublicationDto {
  @ApiProperty({
    description: 'tag item',
    example: 'toys',
  })
  @IsEnum(ItemTag)
  @IsNotEmpty()
  tag: ItemTag;

  @ApiProperty({
    description: 'category item',
    example: 'exchange or gift',
  })
  @IsEnum(categoryTag)
  @IsNotEmpty()
  category: categoryTag;
}
