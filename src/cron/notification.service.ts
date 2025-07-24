import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { MeetingService } from '../meeting/meeting.service';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { User } from 'src/user/schemas/user.schema';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class NotificationService {
  constructor(
    private readonly meetingService: MeetingService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  @Cron('0 0 5 * * 1-6', {
    timeZone: 'America/Campo_Grande',
  })
  async handleDailyEmail() {
    const today = dayjs().tz('America/Campo_Grande');

    const formattedDate = today.format('YYYY-MM-DD');
    const [professor] = await this.userService.findAllProfessors();
    if (!professor) return;

    const meetings = await this.meetingService.findDailyMeetings(formattedDate);
    if (meetings.length === 0) {
      return;
    }

    const sortedMeetings = meetings.sort((a, b) =>
      a.timeSlot.localeCompare(b.timeSlot),
    );

    const formattedDateBR = today.format('DD/MM/YYYY');
    let emailText = `Suas reuniões agendadas para hoje (${formattedDateBR}):\n\n`;
    emailText += 'Horário | Aluno | Motivo\n';
    emailText += '-----------------------------\n';
    for (const meeting of sortedMeetings) {
      const user = meeting.userId as User;
      emailText += `${meeting.timeSlot} | ${user?.name} | ${meeting.reason}\n`;
    }

    await this.emailService.sendEmail(
      professor.email,
      `Resumo Diário de Reuniões - ${formattedDateBR}`,
      emailText,
    );
  }
}
