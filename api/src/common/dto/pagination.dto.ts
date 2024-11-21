import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @IsOptional()
  limit: number;

  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @IsOptional()
  page: number;
}
