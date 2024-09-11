import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meeting, MeetingDocument } from './schemas/meeting.schema';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { ScheduleService } from '../schedule/schedule.service';  // Importe o ScheduleService

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
    console.log('Buscando reunião para o userId:', id);
  
    const meeting = await this.meetingModel
      .findOne({ userId: id, date: { $gte: new Date() } })  // Ajuste aqui para comparar com a data atual
      .sort({ date: 1 })
      .exec();
  
    if (!meeting) {
      console.log('Nenhuma reunião encontrada.');
      return null;
    }
  
    console.log('Reunião encontrada:', meeting);
    return meeting;
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
    // Implementar lógica de notificação (email, push notification, etc.)
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
      return null;  // Retorne null se a reunião não existir
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
