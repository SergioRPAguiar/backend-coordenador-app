import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { EmailService } from '../email/email.service';
import { User } from '../user/types/user.types';

type CreateUserWithSystemFields = CreateUserDto & {
  confirmationCode: string;
  isConfirmed: boolean;
};
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      if (!user.isConfirmed) {
        throw new UnauthorizedException(
          'Confirme seu e-mail antes de fazer login',
        );
      }
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.passwordResetCode !== code) {
      throw new BadRequestException('Código inválidoooo');
    }

    if (
      !user.passwordResetExpiresAt ||
      new Date() > new Date(user.passwordResetExpiresAt)
    ) {
      throw new BadRequestException('Código expirado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.update(user._id.toString(), {
      password: hashedPassword,
      passwordResetCode: null,
      passwordResetExpiresAt: null,
    });

    return { message: 'Senha redefinida com sucesso' };
  }

  async confirmUser(email: string, code: string): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (
      user.confirmationCodeExpiresAt &&
      new Date() > new Date(user.confirmationCodeExpiresAt)
    ) {
      throw new UnauthorizedException('Código expirado');
    }

    if (user.confirmationCode?.trim() !== code.trim()) {
      throw new UnauthorizedException('Código inválido');
    }

    user.isConfirmed = true;
    user.confirmationCode = undefined;
    user.confirmationCodeExpiresAt = undefined;

    await user.save();

    return { message: 'Conta confirmada com sucesso' };
  }

  async login(user: any) {
    const payload = {
      username: user.email,
      sub: user._id.toString(),
      professor: user.professor,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userService.findByEmail(
        createUserDto.email,
      );

      if (existingUser) {
        throw new BadRequestException('Este email já está em uso');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const confirmationCode = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();

      const user = await this.userService.create({
        ...createUserDto,
        password: hashedPassword,
        confirmationCode,
        isConfirmed: false,
      } as CreateUserWithSystemFields);

      try {
        await this.emailService.sendEmail(
          user.email,
          'Confirmação de Cadastro',
          `Seu código de confirmação é: ${confirmationCode}`,
        );
      } catch (emailError) {
        await this.userService.remove(user._id.toString());
        throw new BadRequestException('Falha ao enviar email de confirmação');
      }

      return { message: 'Código de confirmação enviado para seu e-mail' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'Falha no registro. Tente novamente mais tarde.',
      );
    }
  }

  async resendCode(email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.isConfirmed) {
      throw new BadRequestException('Usuário já confirmado');
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    await this.userService.update(user._id.toString(), {
      confirmationCode: newCode,
    });

    await this.emailService.sendEmail(
      user.email,
      'Novo Código de Confirmação',
      `Seu novo código de confirmação é: ${newCode}`,
    );

    return { message: 'Novo código enviado com sucesso' };
  }

  async getUserFromRequest(request: Request) {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException(
        'Cabeçalho de autorização não encontrado',
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = this.jwtService.verify(token) as JwtPayload;
    const user = await this.userService.findOne(decoded.sub);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return user;
  }
}

interface JwtPayload {
  sub: string;
  username: string;
}
