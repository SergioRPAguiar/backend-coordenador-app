import { forwardRef,Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';
import { Meeting, MeetingSchema } from './schemas/meeting.schema';
import { EmailModule } from '../email/email.module';
import { ScheduleModule } from '../schedule/schedule.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meeting.name, schema: MeetingSchema }]),
    EmailModule,
    forwardRef(() => ScheduleModule),
    UserModule,
  ],
  controllers: [MeetingController],
  providers: [MeetingService],
  exports: [MeetingService, MongooseModule],
})
export class MeetingModule {}
