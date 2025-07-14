import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Patch,
  Delete,
  UseGuards,
  HttpException,
  ConflictException,
  HttpStatus,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Schedule } from './schemas/schedule.schema';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('available/:date')
  async findAvailable(@Param('date') date: string): Promise<Schedule[]> {
    return this.scheduleService.findAvailableByDate(date);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('professor', 'isAdmin')
  @Post()
  async create(@Body() dto: CreateScheduleDto): Promise<Schedule> {
    try {
      return await this.scheduleService.markAvailability(
        dto.date,
        dto.timeSlot,
        dto.available ?? false,
        dto.professorId,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('professor', 'isAdmin')
  @Get()
  async findAll(): Promise<Schedule[]> {
    return this.scheduleService.findAll();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('professor', 'isAdmin')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Schedule> {
    const schedule = await this.scheduleService.findOne(id);
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    return schedule;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('professor', 'isAdmin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    const updatedSchedule = await this.scheduleService.update(
      id,
      updateScheduleDto,
    );
    if (!updatedSchedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    return updatedSchedule;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('isAdmin')
  @Delete('clean')
  async cleanSchedules(): Promise<{ message: string }> {
    await this.scheduleService.cleanAllSchedules();
    return { message: 'Todas as schedules foram removidas!' };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('professor', 'isAdmin')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    const result = await this.scheduleService.remove(id);
    if (!result) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    return { message: `Schedule with ID ${id} deleted successfully` };
  }
}
