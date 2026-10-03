import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Severity } from '@prisma/client';

const FAILURE_TYPES = [
  'POWER_OFF',
  'YELLOW_FLASHING',
  'RED_STUCK',
  'GREEN_STUCK',
  'DAMAGED',
  'ACCIDENT',
  'POTHOLE',
  'ROADWORK',
  'CONGESTION',
  'OTHER',
] as const;

export class CreateReportDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description: string;

  @Type(() => Number)
  @IsLatitude()
  latitude: number;

  @Type(() => Number)
  @IsLongitude()
  longitude: number;

  @IsEnum(Severity)
  severity: Severity;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsIn(FAILURE_TYPES)
  failureType?: (typeof FAILURE_TYPES)[number];
}
