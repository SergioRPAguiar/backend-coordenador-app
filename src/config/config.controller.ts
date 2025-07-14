import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ConfigService } from './config.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  async getConfig() {
    return this.configService.getConfig();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('isAdmin')
  @Post('update-name')
  async updateAppName(@Body() body: { appName: string }) {
    return this.configService.updateAppName(body.appName);
  }
}
