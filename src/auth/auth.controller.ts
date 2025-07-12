import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../user/types/user.types';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.authService.login(user);
  }

  @Post('confirm')
  async confirmUser(@Body() body: { email: string; code: string }) {
    const result = await this.authService.confirmUser(body.email, body.code);
    return {
      statusCode: 200,
      message: result.message,
    };
  }

  @Post('update-password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Body() body: { currentPassword: string; newPassword: string },
    @Req() req: any,
  ) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    // Verificar senha atual
    const isPasswordValid = await bcrypt.compare(
      body.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    // Validar nova senha
    if (body.newPassword.length < 6) {
      throw new BadRequestException('A senha deve ter pelo menos 6 caracteres');
    }

    const updatedUser = await this.userService.updatePassword(
      userId,
      body.newPassword,
    );

    if (!updatedUser) {
      throw new InternalServerErrorException('Falha ao atualizar a senha');
    }

    return { message: 'Senha atualizada com sucesso' };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    const { email, code, newPassword } = body;

    const user = await this.userService.findByEmail(email);
    console.log('Código recebido:', code);
    console.log('Código salvo no usuário:', user.passwordResetCode);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica se o código enviado corresponde ao código de reset de senha
    if (user.passwordResetCode !== code) {
      throw new BadRequestException('Código inválido');
    }

    // Verifica se o código expirou
    if (
      !user.passwordResetExpiresAt ||
      new Date() > new Date(user.passwordResetExpiresAt)
    ) {
      throw new BadRequestException('Código expirado');
    }

    // Atualiza a senha e limpa os campos de código e expiração
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userService.update(user.id, {
      password: user.password,
      passwordResetCode: null,
      passwordResetExpiresAt: null,
    });

    return { message: 'Senha redefinida com sucesso' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    const user = await this.userService.findByEmail(body.email);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    await this.userService.update(user._id.toString(), {
      passwordResetCode: code,
      passwordResetExpiresAt: expiresAt,
    });

    await this.emailService.sendResetPasswordCode(user.email, code);

    return { message: 'Código enviado com sucesso' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUserFromRequest(@Req() request: ExpressRequest) {
    return this.authService.getUserFromRequest(request);
  }

  @Post('confirm-reset')
  async confirmResetPassword(@Body() body: { email: string; code: string }) {
    const user = await this.userService.findByEmail(body.email);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (user.passwordResetCode !== body.code) {
      throw new BadRequestException('Código inválido');
    }

    if (new Date() > new Date(user.passwordResetExpiresAt)) {
      throw new BadRequestException('Código expirado');
    }

    return { valid: true };
  }

  @Post('resend-code')
  async resendCode(
    @Body() body: { email: string; mode?: 'cadastro' | 'senha' },
  ) {
    const user = await this.userService.findByEmail(body.email);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    // ✅ Fluxo de confirmação de cadastro
    if (!body.mode || body.mode === 'cadastro') {
      if (user.isConfirmed) {
        throw new BadRequestException('Usuário já confirmado');
      }

      await this.userService.update(user._id.toString(), {
        confirmationCode: newCode,
        confirmationCodeExpiresAt: expiresAt,
      });

      await this.emailService.sendEmail(
        user.email,
        'Novo Código de Confirmação',
        `Seu novo código de confirmação é: ${newCode}`,
      );
    }
    // ✅ Fluxo de recuperação de senha
    else if (body.mode === 'senha') {
      await this.userService.update(user._id.toString(), {
        passwordResetCode: newCode,
        passwordResetExpiresAt: expiresAt,
      });

      await this.emailService.sendResetPasswordCode(user.email, newCode);
    } else {
      throw new BadRequestException('Tipo de reenvio não especificado');
    }

    return { message: 'Novo código enviado com sucesso' };
  }
}
