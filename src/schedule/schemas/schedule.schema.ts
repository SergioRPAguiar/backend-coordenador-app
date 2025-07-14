import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ScheduleDocument = Schedule & Document;
@Schema()
export class Schedule {
  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  timeSlot: string;

  @Prop({ default: false })
  available: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  professorId: string;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

ScheduleSchema.index(
  { date: 1, timeSlot: 1 },
  { unique: true, name: 'date_1_timeSlot_1' }
);