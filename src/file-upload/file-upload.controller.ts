import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Res,
  Param,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ConfigService } from '../config/config.service';
import { FileUploadService } from './file-upload.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';

@Controller()
export class FileUploadController {
  constructor(
    private readonly configService: ConfigService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('isAdmin')
  @Post('upload/logo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    const filename = 'logo.png';
    await this.fileUploadService.uploadFile(file);
    const logoUrl = `${process.env.API_URL}/files/${filename}`;

    await this.configService.updateLogoUrl(logoUrl);

    return { url: logoUrl };
  }

  @Get('files/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const { stream, contentType } =
        await this.fileUploadService.getFileStream(filename);
      res.set('Content-Type', contentType);
      stream.pipe(res);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).send('Arquivo não encontrado');
      } else {
        res.status(500).send('Erro interno do servidor');
      }
    }
  }
}
