import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsBoolean()
  @IsOptional()
  isConfirmed?: boolean;

  @IsString()
  @IsOptional()
  confirmationCode?: string;

  @IsDateString()
  @IsOptional()
  confirmationCodeExpiresAt?: Date;

  @IsString()
  @IsOptional()
  passwordResetCode?: string;

  @IsDateString()
  @IsOptional()
  passwordResetExpiresAt?: Date;

  @IsString()
  @IsOptional()
  contato?: string;

  @IsBoolean()
  @IsOptional()
  professor?: boolean;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;
}
