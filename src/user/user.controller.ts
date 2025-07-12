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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return user;
  }

  @Patch(':id/set-admin')
  @UseGuards(JwtAuthGuard)
  async setAdminStatus(
    @Param('id') id: string,
    @Body('isAdmin') isAdmin: boolean,
    @Req() req: any,
  ): Promise<User> {
    // Só um admin pode promover outro
    if (!req.user.isAdmin) {
      throw new NotFoundException(
        'Acesso negado: apenas administradores podem promover usuários.',
      );
    }

    return this.userService.setAdminStatus(id, isAdmin);
  }

  @Patch(':id/promote')
  @UseGuards(JwtAuthGuard)
  async promoteToProfessor(
    @Param('id') id: string,
    @Request() req,
  ): Promise<User> {
    const user = req.user;

    if (!user.isAdmin) {
      throw new ForbiddenException(
        'Acesso negado. Apenas administradores podem fazer isso.',
      );
    }

    return this.userService.update(id, { professor: true });
  }

  @Patch(':id')
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

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    const result = await this.userService.remove(id);
    if (!result) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return { message: `Usuário com ID ${id} deletado com sucesso` };
  }
}
