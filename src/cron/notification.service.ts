import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { MeetingService } from '../meeting/meeting.service';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class NotificationService {
  constructor(
    private readonly meetingService: MeetingService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  @Cron('0 6 * * 1 6', {
    timeZone: 'America/Campo_Grande',
  })
  async handleDailyEmail() {
    const today = dayjs().tz('America/Campo_Grande');

    if (today.day() === 0) return;

    const formattedDate = today.format('YYYY-MM-DD');
    const formattedDateBR = today.format('DD/MM/YYYY');

    try {
      const [professor] = await this.userService.findAllProfessors();
      if (!professor) {
        return;
      }

      const meetings =
        await this.meetingService.findDailyMeetings(formattedDate);
      const sortedMeetings = meetings.sort((a, b) =>
        a.timeSlot.localeCompare(b.timeSlot),
      );
      let emailText = `Suas reuniões agendadas para hoje (${formattedDateBR}):\n\n`;

      if (sortedMeetings.length === 0) {
        emailText += 'Nenhuma reunião agendada para hoje.\n';
      } else {
        emailText += 'Horário | Aluno | Motivo\n';
        emailText += '-----------------------------\n';

        for (const meeting of sortedMeetings) {
          const user = meeting.userId as any;
          emailText += `${meeting.timeSlot} | ${user?.name || 'N/A'} | ${meeting.reason}\n`;
        }
      }

      await this.emailService.sendEmail(
        professor.email,
        `Resumo Diário de Reuniões - ${formattedDateBR}`,
        emailText,
      );
    } catch (error) {
    }
  }
}
