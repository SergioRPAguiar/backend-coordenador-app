import { IsString } from 'class-validator';

export class UpdateContactDto {
  @IsString()
  contato: string;
}