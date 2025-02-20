import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';

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
      throw new UnauthorizedException('Invalid credentials');
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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUserFromRequest(@Req() request: ExpressRequest) {
    return this.authService.getUserFromRequest(request);
  }

  @Post('resend-code')
  async resendCode(@Body() body: { email: string }) {
    return this.authService.resendCode(body.email);
  }
}
