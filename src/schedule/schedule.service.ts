import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule, ScheduleDocument } from './schemas/schedule.schema';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { DeleteResult } from 'mongoose';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>
  ) {}

  async findAvailableByDate(date: string): Promise<Schedule[]> {
    return this.scheduleModel.find({ date, available: true }).exec();
  }

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const createdSchedule = new this.scheduleModel(createScheduleDto);
    return createdSchedule.save();
  }

  async findAll(): Promise<Schedule[]> {
    return this.scheduleModel.find().exec();
  }

  async findOne(id: string): Promise<Schedule | null> {
    return this.scheduleModel.findById(id).exec();
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<Schedule | null> {
    return this.scheduleModel.findByIdAndUpdate(id, updateScheduleDto, { new: true }).exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.scheduleModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async markAvailability(date: string, timeSlot: string, available: boolean): Promise<Schedule> {
    try {
      return await this.scheduleModel.findOneAndUpdate(
        { date, timeSlot },
        { available },
        { 
          new: true,
          upsert: true,
          setDefaultsOnInsert: true 
        }
      );
    } catch (error) {
      console.error('Erro no markAvailability:', error);
      throw new ConflictException('Erro ao atualizar horário');
    }
  }
  
  async cleanAllSchedules(): Promise<DeleteResult> {
    return this.scheduleModel.deleteMany({});
  }

  async isTimeSlotAvailable(date: string, timeSlot: string): Promise<boolean> {
    const schedule = await this.scheduleModel.findOne({
      date,
      timeSlot
    });
    
    return schedule?.available || false;
  }

  async getAvailableSlots(date: string): Promise<Schedule[]> {
    return this.scheduleModel.find({ date, available: true }).exec();
  }
}