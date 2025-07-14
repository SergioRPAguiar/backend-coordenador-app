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
import { User } from 'src/user/schemas/user.schema';
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
    const formattedDate = dayjs(createMeetingDto.date).format('YYYY-MM-DD');

    const diaSemana = new Date(formattedDate).getDay();
    if (diaSemana === 6) {
      throw new BadRequestException(
        'Reuniões não podem ser marcadas no Domingo',
      );
    }

    const isAvailable = await this.scheduleService.isTimeSlotAvailable(
      formattedDate,
      createMeetingDto.timeSlot,
    );

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

    const schedule = await this.scheduleService.findScheduleByDateAndTime(
      formattedDate,
      createMeetingDto.timeSlot,
    );

    if (!schedule || !schedule.professorId) {
      throw new BadRequestException(
        'Não foi possível determinar o professor responsável pelo horário',
      );
    }

    const createdMeeting = new this.meetingModel({
      ...createMeetingDto,
      date: formattedDate,
      professorId: schedule.professorId.toString(),
    });

    await createdMeeting.save();

    await this.scheduleService.markAvailability(
      formattedDate,
      createMeetingDto.timeSlot,
      false,
      schedule.professorId.toString(),
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

  async findNextMeetingForProfessor(
    professorId: string,
  ): Promise<MeetingWithDateObject | null> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    const meeting = await this.meetingModel
      .findOne({
        professorId,
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
        meeting.professorId,
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

  async notifyUsers(
    meeting: Meeting,
    cancelledByUserId: string,
  ): Promise<void> {
    const cancellingUser = await this.userService.findOne(cancelledByUserId);
    if (!cancellingUser) {
      return;
    }

    let recipient: User | null = null;

    if (meeting.userId.toString() === cancelledByUserId) {
      recipient = await this.userService.findOne(meeting.professorId);
    } else {
      recipient = await this.userService.findOne(meeting.userId);
    }

    if (!recipient) {
      return;
    }

    const formattedDate = dayjs(meeting.date).format('DD/MM/YYYY');
    const subject = 'Reunião Cancelada';

    const text = `Olá ${recipient.name},

A reunião agendada no Coordenador.app para o dia ${formattedDate} às ${meeting.timeSlot} foi cancelada por **${cancellingUser.name}**.

📝 Motivo: ${meeting.cancelReason}

Atenciosamente,
Equipe Coordenador.app`;

    try {
      await this.emailService.sendEmail(recipient.email, subject, text);
    } catch (error) {}
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
