import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingController } from './meeting/meeting.controller';
import { MeetingService } from './meeting/meeting.service';
import { Meeting, MeetingSchema } from './meeting/schemas/meeting.schema';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { User, UserSchema } from './user/schemas/user.schema';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ScheduleModule } from './schedule/schedule.module'; // Importe o ScheduleModule

@Module({
  imports: [
    AuthModule,
    UserModule,

    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/nestdb'),

    MongooseModule.forFeature([{ name: Meeting.name, schema: MeetingSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    ScheduleModule,  // Adicione o ScheduleModule aqui
  ],
  controllers: [MeetingController, UserController],
  providers: [MeetingService, UserService],
})
export class AppModule {}
