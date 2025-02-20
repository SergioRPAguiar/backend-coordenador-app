import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingController } from './meeting/meeting.controller';
import { MeetingService } from './meeting/meeting.service';
import { Meeting, MeetingSchema } from './meeting/schemas/meeting.schema';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { NotificationService } from './cron/notification.service';
import { User, UserSchema } from './user/schemas/user.schema';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ScheduleModule as MyScheduleModule } from './schedule/schedule.module';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { EmailModule } from './email/email.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { HttpsRedirectMiddleware } from './middlewares/https-redirect.middleware'; 
import { FileUploadService } from './file-upload/file-upload.service';
import { FileUploadModule } from './file-upload/file-upload.module';


@Module({
  imports: [
    NestScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    ServeStaticModule.forRoot(FileUploadService.config()),
    FileUploadModule,
    MongooseModule.forRoot(process.env.MONGO_URI),
    MongooseModule.forFeature([{ name: Meeting.name, schema: MeetingSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MyScheduleModule,
    EmailModule,
  ],
  controllers: [MeetingController, UserController],
  providers: [
    MeetingService, 
    UserService,
    NotificationService
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    //consumer.apply(HttpsRedirectMiddleware)
      //.exclude({ path: 'health', method: RequestMethod.GET })
      //.forRoutes('*');
  }
}
