import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Severity } from '@prisma/client';

export class CreateReportDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsEnum(Severity)
  severity: Severity;
}
