import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MeetingDocument = Meeting & Document;

@Schema()
export class Meeting {
  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  timeSlot: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true })
  userId: string;  // Relaciona a reunião com um usuário
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
