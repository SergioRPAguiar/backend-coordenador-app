import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';
import { Meeting, MeetingSchema } from './schemas/meeting.schema';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meeting.name, schema: MeetingSchema }]),
    EmailModule,
  ],
  controllers: [MeetingController],
  providers: [MeetingService],
})
export class MeetingModule {}
