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
  userId: string;  
  
  @Prop({ default: false })
  canceled: boolean;
  
  @Prop()
  cancelReason: string;
  
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
