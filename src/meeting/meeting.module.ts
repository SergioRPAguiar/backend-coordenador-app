import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';
import { Meeting, MeetingSchema } from './schemas/meeting.schema';
import { EmailModule } from '../email/email.module'; // Importar módulo de e-mail

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meeting.name, schema: MeetingSchema }]),
    EmailModule, // Registrar módulo de e-mail
  ],
  controllers: [MeetingController],
  providers: [MeetingService],
})
export class MeetingModule {}
