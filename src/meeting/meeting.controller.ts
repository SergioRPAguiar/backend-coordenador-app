import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { Meeting } from './schemas/meeting.schema';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post()
  async create(@Body() createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    return this.meetingService.create(createMeetingDto);
  }

  @Get('next')
  async findNextMeeting(
    @Query('userId') userId: string,
  ): Promise<Meeting | null> {
    const meeting = await this.meetingService.findNextMeetingByUserId(userId);
    if (!meeting) {
      throw new NotFoundException(
        `Nenhuma reunião futura encontrada para o usuário com ID ${userId}`,
      );
    }
    return meeting;
  }

  @Get('nextForProfessor')
  async findNextMeetingForProfessor(): Promise<Meeting | null> {
    return this.meetingService.findNextMeetingForProfessor();
  }

  @Get()
  async findAll(): Promise<Meeting[]> {
    return this.meetingService.findAll();
  }

  @Get('allFutureForProfessor')
  async findAllFutureMeetingsForProfessor(): Promise<Meeting[]> {
    return this.meetingService.findAllFutureMeetingsForProfessor();
  }

  @Get('allForStudent')
  async findAllMeetingsForStudent(
    @Query('userId') userId: string,
  ): Promise<Meeting[]> {
    return this.meetingService.findAllMeetingsForStudent(userId);
  }

  @Patch(':id/cancel')
  async cancelMeeting(
    @Param('id') id: string,
    @Body() cancelDto: { reason: string; userId: string },
  ): Promise<Meeting> {
    const meeting = await this.meetingService.cancel(
      id,
      cancelDto.reason,
      cancelDto.userId,
    );

    if (!meeting) {
      throw new NotFoundException(`Reunião com ID ${id} não encontrada`);
    }

    await this.meetingService.notifyUsers(meeting);
    return meeting;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Meeting> {
    const meeting = await this.meetingService.findOne(id);
    if (!meeting) {
      throw new NotFoundException(`Reunião com ID ${id} não encontrada`);
    }
    return meeting;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMeetingDto: UpdateMeetingDto,
  ): Promise<Meeting> {
    const updatedMeeting = await this.meetingService.update(
      id,
      updateMeetingDto,
    );
    if (!updatedMeeting) {
      throw new NotFoundException(`Reunião com ID ${id} não encontrada`);
    }
    return updatedMeeting;
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    const result = await this.meetingService.remove(id);
    if (!result) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    return { message: `Reunião com ID ${id} excluída com sucesso` };
  }
  @Delete()
  async removeAll(): Promise<{ message: string }> {
    return this.meetingService.removeAll();
  }
}
