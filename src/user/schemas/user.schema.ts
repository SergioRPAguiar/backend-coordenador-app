import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsDateString, IsOptional } from 'class-validator';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  contato: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  professor: boolean;

  @Prop({ default: false })
  isConfirmed: boolean;

  @Prop()
  confirmationCode?: string; 
  @Prop()
  confirmationCodeExpiresAt?: Date;

  @Prop()
  passwordResetCode?: string;

  @Prop()
  passwordResetExpiresAt?: Date;

  @Prop({ default: false })
  isAdmin: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
