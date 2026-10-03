import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ReportPriority } from '@prisma/client';

export class ValidateReportDto {
  @IsBoolean()
  approved: boolean;

  @IsOptional()
  @IsEnum(ReportPriority)
  priority?: ReportPriority;
}
