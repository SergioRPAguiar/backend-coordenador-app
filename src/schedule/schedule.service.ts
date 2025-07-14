import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, DeleteResult } from 'mongoose';
import { Schedule, ScheduleDocument } from './schemas/schedule.schema';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Meeting, MeetingDocument } from '../meeting/schemas/meeting.schema';
import * as dayjs from 'dayjs';
@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
    @InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>,
  ) {}

  async findAvailableByDate(date: string): Promise<Schedule[]> {
    return this.scheduleModel.find({ date, available: true }).exec();
  }

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const createdSchedule = new this.scheduleModel(createScheduleDto);
    try {
      return await createdSchedule.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Horário já cadastrado para esta data');
      }
      throw error;
    }
  }

  async findAll(): Promise<Schedule[]> {
    return this.scheduleModel.find().exec();
  }

  async findOne(id: string): Promise<Schedule | null> {
    return this.scheduleModel.findById(id).exec();
  }

  async update(
    id: string,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule | null> {
    return this.scheduleModel
      .findByIdAndUpdate(id, updateScheduleDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.scheduleModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async markAvailability(
    date: string,
    timeSlot: string,
    available: boolean,
    professorId: string,
  ): Promise<Schedule> {
    try {
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      if (available) {
        const existingMeeting = await this.meetingModel.findOne({
          date: formattedDate,
          timeSlot,
          canceled: false,
        });

        if (existingMeeting) {
          throw new ConflictException(
            `Horário já reservado para ${formattedDate} às ${timeSlot}`,
          );
        }
      }

      return await this.scheduleModel.findOneAndUpdate(
        { date: formattedDate, timeSlot, professorId },
        {
          $set: { available },
          $setOnInsert: { date: formattedDate, timeSlot, professorId },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      );
    } catch (error) {
      throw new ConflictException(error.message || 'Erro ao atualizar horário');
    }
  }

  async findScheduleByDateAndTime(
    date: string,
    timeSlot: string,
  ): Promise<Schedule | null> {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    return this.scheduleModel.findOne({ date: formattedDate, timeSlot }).exec();
  }

  async cleanAllSchedules(): Promise<DeleteResult> {
    return this.scheduleModel.deleteMany({});
  }

  async isTimeSlotAvailable(date: string, timeSlot: string): Promise<boolean> {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    const schedule = await this.scheduleModel.findOne({
      date: formattedDate,
      timeSlot,
    });
    return schedule?.available || false;
  }

  async getAvailableSlots(date: string): Promise<Schedule[]> {
    return this.scheduleModel.find({ date, available: true }).exec();
  }
}
