import { InjectModel } from "@nestjs/mongoose";
import { Config, ConfigDocument } from "./schemas/config.schema";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ConfigService {
  constructor(
    @InjectModel(Config.name) private configModel: Model<ConfigDocument>
  ) {}

  async getConfig() {
    let config = await this.configModel.findOne();
    const newAppName = 'Agenda Cotad'; 
    const newLogoUrl = `${process.env.API_URL_APP}/files/logoif.png`;
    
    if (!config) {
      config = await this.configModel.create({
        appName: newAppName,
        logoUrl: newLogoUrl,
      });
    } else if (config.appName !== newAppName || config.logoUrl !== newLogoUrl) {
      config.appName = newAppName;
      config.logoUrl = newLogoUrl;
      await config.save();
    }
    return config;
  }

  async updateLogoUrl(logoUrl: string) {
    let config = await this.configModel.findOne();
    if (!config) {
      config = await this.configModel.create({
        appName: 'Agenda Cotad',
        logoUrl,
      });
    } else {
      config.logoUrl = logoUrl;
      await config.save();
    }
    return config;
  }
}