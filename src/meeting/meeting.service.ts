import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meeting, MeetingDocument } from './schemas/meeting.schema';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { ScheduleService } from '../schedule/schedule.service';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
interface MeetingWithDateObject extends Meeting {
  dateObject?: Date;
}

@Injectable()
export class MeetingService {
  constructor(
    @InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>,
    private readonly scheduleService: ScheduleService,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
  ) {}

  async create(createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    // 🔧 Normaliza a data para 'YYYY-MM-DD'
    const formattedDate = dayjs(createMeetingDto.date).format('YYYY-MM-DD');

    const isAvailable = await this.scheduleService.isTimeSlotAvailable(
      formattedDate,
      createMeetingDto.timeSlot,
    );

    const diaSemana = new Date(formattedDate).getDay();
    if (diaSemana === 6) {
      throw new BadRequestException(
        'Reuniões não podem ser marcadas no Domingo',
      );
    }

    if (!isAvailable) {
      throw new BadRequestException('Horário indisponível');
    }

    if (
      !createMeetingDto.date ||
      !createMeetingDto.timeSlot ||
      !createMeetingDto.reason ||
      !createMeetingDto.userId
    ) {
      throw new BadRequestException('Faltam informações obrigatórias');
    }

    const createdMeeting = new this.meetingModel({
      ...createMeetingDto,
      date: formattedDate,
    });
    await createdMeeting.save();

    await this.scheduleService.markAvailability(
      formattedDate,
      createMeetingDto.timeSlot,
      false,
    );

    return createdMeeting;
  }

  async findNextMeetingByUserId(id: string): Promise<Meeting | null> {
    const now = dayjs();
    const allMeetings = await this.meetingModel
      .find({
        userId: id,
        canceled: false,
      })
      .sort({ date: 1, timeSlot: 1 })
      .exec();

    console.log('Filtrando reuniões futuras para o usuário:', id);
    console.log(
      'Reuniões encontradas:',
      allMeetings.map((m) => m.date + ' ' + m.timeSlot),
    );

    const nextMeeting = allMeetings.find((meeting) => {
      const startHour = meeting.timeSlot.split(' - ')[0];
      const fullDateTime = dayjs(
        `${meeting.date} ${startHour}`,
        'YYYY-MM-DD HH:mm',
      );
      return fullDateTime.isAfter(now);
    });

    if (!nextMeeting) {
      throw new NotFoundException(
        `Nenhuma reunião futura encontrada para o usuário com ID ${id}`,
      );
    }

    return nextMeeting;
  }

  async findAllMeetingsForStudent(userId: string): Promise<Meeting[]> {
    return this.meetingModel
      .find({
        userId: userId,
        canceled: false,
      })
      .sort({ date: 1, timeSlot: 1 })
      .exec();
  }

  async findNextMeetingForProfessor(): Promise<MeetingWithDateObject | null> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    const meeting = await this.meetingModel
      .findOne({
        canceled: false,
        $or: [
          { date: { $gt: today } },
          { date: today, timeSlot: { $gt: currentTime } },
        ],
      })
      .sort({ date: 1, timeSlot: 1 })
      .exec();

    if (!meeting) {
      throw new NotFoundException('Nenhuma reunião futura encontrada');
    }

    const meetingObject = meeting.toObject();
    const dateObject = new Date(
      `${meetingObject.date}T${meetingObject.timeSlot.split(' - ')[0]}:00Z`,
    );

    return { ...meetingObject, dateObject };
  }

  async findAllFutureMeetingsForProfessor(): Promise<Meeting[]> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    return this.meetingModel
      .find({
        $or: [
          { date: { $gt: today } },
          { date: today, timeSlot: { $gt: currentTime } },
        ],
      })
      .populate('userId', 'name email contato')
      .sort({ date: 1, timeSlot: 1 })
      .exec();
  }

  async cancel(
    id: string,
    reason: string,
    userId: string,
  ): Promise<Meeting | null> {
    const meeting = await this.meetingModel
      .findByIdAndUpdate(
        id,
        { canceled: true, cancelReason: reason },
        { new: true },
      )
      .exec();

    if (!meeting) {
      throw new NotFoundException(`Reunião com ID ${id} não encontrada`);
    }

    const user = await this.userService.findOne(userId);
    const isStudent = !user?.professor;

    if (isStudent) {
      await this.scheduleService.markAvailability(
        meeting.date,
        meeting.timeSlot,
        true,
      );
    }

    return meeting;
  }

  async removeAll(): Promise<{ message: string }> {
    const result = await this.meetingModel.deleteMany({});
    return {
      message: `${result.deletedCount} reuniões foram removidas com sucesso`,
    };
  }

  async notifyUsers(meeting: Meeting): Promise<void> {
    const recipientId = meeting.userId;
    const user = await this.userService.findOne(recipientId);
    if (!user) {
      console.error('Usuário não encontrado para notificação.');
      return;
    }

    const email = user.email;
    const subject = 'Reunião Cancelada';
    const formattedDate = dayjs(meeting.date).format('DD/MM/YYYY');
    const text = `Olá! A reunião agendada no Coordenador.app para o dia ${formattedDate} às ${meeting.timeSlot} foi cancelada.\n\nMotivo do cancelamento: ${meeting.cancelReason}`;

    try {
      await this.emailService.sendEmail(email, subject, text);
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
    }
  }

  async findAll(): Promise<Meeting[]> {
    return this.meetingModel.find().exec();
  }

  async findOne(id: string): Promise<Meeting | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID inválido: ${id}`);
    }

    const meeting = await this.meetingModel.findById(id).exec();
    if (!meeting) {
      return null;
    }
    return meeting;
  }

  async update(
    id: string,
    updateMeetingDto: UpdateMeetingDto,
  ): Promise<Meeting> {
    const updatedMeeting = await this.meetingModel
      .findByIdAndUpdate(id, updateMeetingDto, { new: true })
      .exec();
    if (!updatedMeeting) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    return updatedMeeting;
  }

  async findDailyMeetings(date: string): Promise<Meeting[]> {
    return this.meetingModel
      .find({
        date,
        canceled: false,
      })
      .exec();
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.meetingModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    return { message: `Meeting with ID ${id} deleted successfully` };
  }
}
