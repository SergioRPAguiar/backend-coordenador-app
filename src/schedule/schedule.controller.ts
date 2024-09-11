import { Controller, Get, Post, Body, Param, NotFoundException, Patch, Delete, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Schedule } from './schemas/schedule.schema';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('available/:date')
  async findAvailable(@Param('date') date: string): Promise<Schedule[]> {
    return this.scheduleService.findAvailableByDate(date); // Chama o método correto no service
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const { date, timeSlot, available } = createScheduleDto;
    return this.scheduleService.markAvailability(date, timeSlot, available);
}


  @Get()
  async findAll(): Promise<Schedule[]> {
    return this.scheduleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Schedule> {
    const schedule = await this.scheduleService.findOne(id);
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    return schedule;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    const updatedSchedule = await this.scheduleService.update(id, updateScheduleDto);
    if (!updatedSchedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    return updatedSchedule;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    const result = await this.scheduleService.remove(id);
    if (!result) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    return { message: `Schedule with ID ${id} deleted successfully` };
  }
}
