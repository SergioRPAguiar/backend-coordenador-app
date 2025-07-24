import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConfigDocument = Config & Document;

@Schema()
export class Config {
  @Prop({ required: true, default: 'Coordenador.App' })
  appName: string;

  @Prop({ required: true, default: 'https://seuservidor.com/logo.png' })
  logoUrl: string;
}

export const ConfigSchema = SchemaFactory.createForClass(Config);