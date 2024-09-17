import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meeting, MeetingDocument } from './schemas/meeting.schema';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { ScheduleService } from '../schedule/schedule.service';  // Importe o ScheduleService

interface MeetingWithDateObject extends Meeting {
  dateObject?: Date;
}

@Injectable()
export class MeetingService {
  constructor(
    @InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>,
    private readonly scheduleService: ScheduleService
  ) {}

  async create(createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    console.log('Dados recebidos no backend para criar reunião:', createMeetingDto);
  
    if (!createMeetingDto.date || !createMeetingDto.timeSlot || !createMeetingDto.reason || !createMeetingDto.userId) {
      throw new BadRequestException('Faltam informações obrigatórias');
    }
  
    const createdMeeting = new this.meetingModel(createMeetingDto);
    await createdMeeting.save();
  
    await this.scheduleService.markAvailability(
      createMeetingDto.date,
      createMeetingDto.timeSlot,
      false
    );
  
    return createdMeeting;
  }

  async findNextMeetingByUserId(id: string): Promise<Meeting | null> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];  
    const currentTime = now.toTimeString().slice(0, 5);
  
    const meeting = await this.meetingModel
      .findOne({
        userId: id,
        canceled: false,  // Ignorar reuniões canceladas
        $or: [
          { date: { $gt: today } },
          { date: today, timeSlot: { $gt: currentTime } },
        ],
      })
      .sort({ date: 1, timeSlot: 1 })
      .exec();
  
    if (!meeting) {
      throw new NotFoundException(`No upcoming meetings found for user with ID ${id}`);
    }
  
    return meeting;
  }
  
  async findAllMeetingsForStudent(userId: string): Promise<Meeting[]> {
    return this.meetingModel
      .find({
        userId: userId,     // Filtra pelas reuniões do aluno
        canceled: false,    // Ignora reuniões canceladas
      })
      .sort({ date: 1, timeSlot: 1 }) // Ordena por data e horário
      .exec();
  }

  async findNextMeetingForProfessor(): Promise<MeetingWithDateObject | null> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
  
    // Adicionando a condição para verificar se a reunião foi cancelada
    const meeting = await this.meetingModel
      .findOne({
        canceled: false,  // Ignorar reuniões canceladas
        $or: [{ date: { $gt: today } }, { date: today, timeSlot: { $gt: currentTime } }],
      })
      .sort({ date: 1, timeSlot: 1 })
      .exec();
  
    if (!meeting) {
      throw new NotFoundException('No upcoming meetings found');
    }
  
    const meetingObject = meeting.toObject();
    const dateObject = new Date(`${meetingObject.date}T${meetingObject.timeSlot.split(' - ')[0]}:00Z`);
  
    return { ...meetingObject, dateObject };
  }

  async findAllFutureMeetingsForProfessor(): Promise<Meeting[]> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    // Buscar todas as reuniões futuras do professor
    return this.meetingModel
      .find({
        $or: [
          { date: { $gt: today } },
          { date: today, timeSlot: { $gt: currentTime } }
        ],
      })
      .sort({ date: 1, timeSlot: 1 })
      .exec();
  }

  async cancel(id: string, reason: string): Promise<Meeting | null> {
    const meeting = await this.meetingModel.findByIdAndUpdate(
      id,
      { canceled: true, cancelReason: reason },
      { new: true }
    ).exec();
  
    if (!meeting) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
  
    return meeting;
  }
  

  async notifyUsers(meeting: Meeting): Promise<void> {
    console.log(`Notificando usuários sobre o cancelamento da reunião ${meeting.userId}`);
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

  async update(id: string, updateMeetingDto: UpdateMeetingDto): Promise<Meeting> {
    const updatedMeeting = await this.meetingModel
      .findByIdAndUpdate(id, updateMeetingDto, { new: true })
      .exec();
    if (!updatedMeeting) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    return updatedMeeting;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.meetingModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    return { message: `Meeting with ID ${id} deleted successfully` };
  }
}
