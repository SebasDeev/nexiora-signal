import { IsIn, IsString } from 'class-validator';

export class UpdateWorkDto {
  @IsString()
  @IsIn(['IN_PROGRESS', 'RESOLVED'])
  status: 'IN_PROGRESS' | 'RESOLVED';
}
