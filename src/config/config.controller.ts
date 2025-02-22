import { Controller, Get, Post, Body } from '@nestjs/common';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {} 

  @Get()
  async getConfig() {
    return this.configService.getConfig(); 
  }

  @Post('update-name')
  async updateAppName(@Body() body: { appName: string }) {
    return this.configService.updateAppName(body.appName); 
  }
}