import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ScheduleDocument = Schedule & Document;

@Schema()
export class Schedule {
  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  timeSlot: string;

  @Prop({ default: false })
  available: boolean;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
