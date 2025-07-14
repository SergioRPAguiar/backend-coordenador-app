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
  UseGuards,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { Meeting } from './schemas/meeting.schema';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';
import { MeetingWithDateObject } from './meeting.types';

@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    return this.meetingService.create(createMeetingDto);
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('professor', 'isAdmin')
  @Get('nextForProfessor')
  async findNextMeetingForProfessor(
    @Request() req,
  ): Promise<MeetingWithDateObject | null> {
    const professorId = req.user.sub;
    return this.meetingService.findNextMeetingForProfessor(professorId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('professor', 'isAdmin')
  @Get()
  async findAll(): Promise<Meeting[]> {
    return this.meetingService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('professor', 'isAdmin')
  @Get('allFutureForProfessor')
  async findAllFutureMeetingsForProfessor(): Promise<Meeting[]> {
    return this.meetingService.findAllFutureMeetingsForProfessor();
  }

  @UseGuards(JwtAuthGuard)
  @Get('allForStudent')
  async findAllMeetingsForStudent(
    @Query('userId') userId: string,
    @Request() req,
  ): Promise<Meeting[]> {
    const requester = req.user;

    if (requester.sub !== userId && !requester.isAdmin) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar essas reuniões',
      );
    }

    return this.meetingService.findAllMeetingsForStudent(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  async cancelMeeting(
    @Param('id') id: string,
    @Body() cancelDto: { reason: string; userId: string },
    @Request() req,
  ): Promise<Meeting> {
    const user = req.user;

    const meeting = await this.meetingService.findOne(id);
    if (!meeting) {
      throw new NotFoundException(`Reunião com ID ${id} não encontrada`);
    }

    const isOwner = meeting.userId?.toString() === user.sub;
    const isProfessor = user.professor === true;
    const isAdmin = user.isAdmin === true;

    if (!isOwner && !isProfessor && !isAdmin) {
      throw new ForbiddenException(
        'Você não tem permissão para cancelar esta reunião',
      );
    }

    const updatedMeeting = await this.meetingService.cancel(
      id,
      cancelDto.reason,
      cancelDto.userId,
    );

    await this.meetingService.notifyUsers(updatedMeeting, user.sub);
    return updatedMeeting;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<Meeting> {
    const meeting = await this.meetingService.findOne(id);
    if (!meeting) {
      throw new NotFoundException(`Reunião com ID ${id} não encontrada`);
    }

    const user = req.user;

    const isOwner = meeting.userId?.toString() === user.sub;
    const isProfessor = user.professor === true;

    if (!isOwner && !isProfessor) {
      throw new ForbiddenException(
        'Você não tem permissão para ver esta reunião',
      );
    }

    return meeting;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMeetingDto: UpdateMeetingDto,
    @Request() req,
  ): Promise<Meeting> {
    const user = req.user;
    const meeting = await this.meetingService.findOne(id);

    if (!meeting) {
      throw new NotFoundException(`Reunião com ID ${id} não encontrada`);
    }

    const isOwner = meeting.userId?.toString() === user.sub;
    const isProfessor = user.professor === true;
    const isAdmin = user.isAdmin === true;

    if (!isOwner && !isProfessor && !isAdmin) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar esta reunião',
      );
    }

    const updatedMeeting = await this.meetingService.update(
      id,
      updateMeetingDto,
    );
    return updatedMeeting;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('isAdmin')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    const result = await this.meetingService.remove(id);
    if (!result) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    return { message: `Reunião com ID ${id} excluída com sucesso` };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('isAdmin')
  @Delete()
  async removeAll(): Promise<{ message: string }> {
    return this.meetingService.removeAll();
  }
}
