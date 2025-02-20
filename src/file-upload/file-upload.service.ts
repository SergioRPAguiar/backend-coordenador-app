import { Injectable } from '@nestjs/common';
import { ServeStaticModuleOptions } from '@nestjs/serve-static';
import { join } from 'path';

@Injectable()
export class FileUploadService {
  static config(): ServeStaticModuleOptions {
    return {
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/files',
    };
  }
}