import { Controller, Get, Injectable } from "@nestjs/common";
import { ConfigService } from "./config.service";

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  async getConfig() {
    return this.configService.getConfig();
  }
}
