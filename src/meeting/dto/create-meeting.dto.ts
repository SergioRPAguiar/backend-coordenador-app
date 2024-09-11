import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateMeetingDto {
  @IsString() // Valida se é uma string
  date: string;

  @IsString()
  timeSlot: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  userId?: string;
}