import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ConfigService } from '../config/config.service';

@Controller('upload')
export class FileUploadController {
  constructor(private readonly configService: ConfigService) {}

  @Post('logo')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        cb(null, file.originalname);
      }
    })
  }))
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    const logoUrl = `${process.env.API_URL}/files/${file.filename}`;
    
    // Atualiza a URL da logo no banco de dados
    await this.configService.updateLogoUrl(logoUrl);

    return {
      url: logoUrl,
    };
  }
}