import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  date: string;

  @IsString()
  timeSlot: string;

  @IsBoolean()
  @IsOptional()  // Caso este campo possa ser opcional
  available?: boolean;
}
