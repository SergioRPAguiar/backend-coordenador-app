import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  date: string;

  @IsString()
  timeSlot: string;

  @IsBoolean()
  @IsOptional()
  available?: boolean;

  @IsString()
  professorId: string;
}
