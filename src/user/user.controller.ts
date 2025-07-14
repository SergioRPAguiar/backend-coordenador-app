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
  Request,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { Roles } from 'src/auth/guards/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('isAdmin')
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req): Promise<User> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    const requester = req.user;

    if (requester._id !== id && !requester.isAdmin) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este usuário',
      );
    }

    return user;
  }

  @Patch(':id/set-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('isAdmin')
  async setAdminStatus(
    @Param('id') id: string,
    @Body('isAdmin') isAdmin: boolean,
  ): Promise<User> {
    return this.userService.setAdminStatus(id, isAdmin);
  }

  @Patch(':id/set-professor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('isAdmin')
  async setProfessorStatus(
    @Param('id') id: string,
    @Body('professor') professor: boolean,
  ): Promise<User> {
    return this.userService.setProfessorStatus(id, professor);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('isAdmin')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const updatedUser = await this.userService.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return updatedUser;
  }

  @Patch(':id/contato')
  @UseGuards(JwtAuthGuard)
  async updateContact(
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
    @Request() req,
  ): Promise<User> {
    const requester = req.user;

    if (requester.sub !== id && !requester.isAdmin) {
      throw new ForbiddenException('Sem permissão para alterar este contato');
    }

    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    const requester = req.user;

    if (requester.sub !== id && !requester.isAdmin) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar este usuário',
      );
    }

    const result = await this.userService.remove(id);
    if (!result) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return { message: `Usuário com ID ${id} deletado com sucesso` };
  }
}
