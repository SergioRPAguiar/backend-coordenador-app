import { InjectModel } from '@nestjs/mongoose';
import { Config, ConfigDocument } from './schemas/config.schema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  constructor(
    @InjectModel(Config.name) private configModel: Model<ConfigDocument>,
  ) {}

  async getConfig() {
    let config = await this.configModel.findOne();

    if (!config) {
      config = await this.configModel.create({
        appName: 'Coordenador.App',
        logoUrl: `${process.env.API_URL}/files/logo.png`,
      });
    }
    return config;
  }

  async updateLogoUrl(logoUrl: string) {
    let config = await this.configModel.findOne();
    if (!config) {
      config = await this.configModel.create({
        appName: 'Coordenador App',
        logoUrl,
      });
    } else {
      config.logoUrl = logoUrl;
      await config.save();
    }
    return config;
  }
  async updateAppName(appName: string) {
    let config = await this.configModel.findOne();
    if (!config) {
      config = await this.configModel.create({ appName });
    } else {
      config.appName = appName;
      await config.save();
    }
    return config;
  }
}
