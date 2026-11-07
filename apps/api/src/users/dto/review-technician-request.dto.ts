import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class ReviewTechnicianRequestDto {
  @IsBoolean()
  approved: boolean;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((request: ReviewTechnicianRequestDto) => !request.approved)
  @IsString()
  @MinLength(10, {
    message: 'Indica un motivo de al menos 10 caracteres para rechazar la solicitud.',
  })
  @MaxLength(1000)
  reviewNote?: string;
}
