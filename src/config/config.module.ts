import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Config, ConfigSchema } from './schemas/config.schema';

@Module({
    imports: [
      MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }])
    ],
    controllers: [ConfigController],
    providers: [ConfigService],
    exports: [ConfigService],
  })
  export class ConfigModule {}