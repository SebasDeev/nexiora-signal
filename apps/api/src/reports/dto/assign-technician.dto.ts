import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReportPriority } from '@prisma/client';

export class AssignTechnicianDto {
  @IsString()
  technicianId: string;

  @IsOptional()
  @IsEnum(ReportPriority)
  priority?: ReportPriority;
}
