import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Reports } from 'src/enums/enum.reports';

export class CreateReportDto {
  @IsEnum(Reports)
  reportType: Reports;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;
}
