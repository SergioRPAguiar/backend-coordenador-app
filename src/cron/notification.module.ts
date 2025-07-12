import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MeetingModule } from '../meeting/meeting.module';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [MeetingModule, UserModule, EmailModule],
  providers: [NotificationService],
  controllers: [NotificationController], 
})
export class NotificationModule {}
