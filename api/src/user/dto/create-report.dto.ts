import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Reports } from 'src/enums/enum.reports';

export class CreateReportDto {
  @ApiProperty({
    description: 'report type',
    example: 'spam',
  })
  @IsEnum(Reports)
  reportType: Reports;

  @ApiProperty({
    description: 'description report',
    example: 'description report',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;
}
