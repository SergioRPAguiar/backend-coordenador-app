import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingController } from './meeting/meeting.controller';
import { MeetingService } from './meeting/meeting.service';
import { Meeting, MeetingSchema } from './meeting/schemas/meeting.schema';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { User, UserSchema } from './user/schemas/user.schema';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ScheduleModule } from './schedule/schedule.module';
import { GoogleCalendarModule } from './google/google-calendar.module';
import { EmailModule } from './email/email.module'; // Adicione aqui o EmailModule

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    GoogleCalendarModule,
    MongooseModule.forRoot('mongodb://localhost:27017/back_agenda_cotad'),
    MongooseModule.forFeature([{ name: Meeting.name, schema: MeetingSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ScheduleModule,
    EmailModule,
  ],
  controllers: [MeetingController, UserController],
  providers: [MeetingService, UserService],
})
export class AppModule {}
