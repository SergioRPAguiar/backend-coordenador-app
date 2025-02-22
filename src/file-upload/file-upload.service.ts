import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { Readable } from 'stream';

@Injectable()
export class FileUploadService {
  private gridFSBucket: GridFSBucket;

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.gridFSBucket = new GridFSBucket(this.connection.db, {
      bucketName: 'uploads',
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const filename = 'logo.png';
  
    const existingFiles = await this.connection.db
      .collection('uploads.files')
      .find({ filename })
      .toArray();
  
    if (existingFiles.length > 0) {
      await this.gridFSBucket.delete(existingFiles[0]._id);
    }
  
    return new Promise((resolve, reject) => {
      const writeStream = this.gridFSBucket.openUploadStream(filename, {
        metadata: { filename },
      });
      
      writeStream.write(file.buffer);
      writeStream.end((error) => {
        if (error) reject(error);
        else resolve(filename);
      });
    });
  }

  async getFileStream(filename: string): Promise<{ stream: Readable; contentType: string }> {
    const files = await this.connection.db
      .collection('uploads.files')
      .find({ filename })
      .toArray();

    if (files.length === 0) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    const contentType = files[0].metadata?.contentType || 'application/octet-stream';
    const stream = this.gridFSBucket.openDownloadStreamByName(filename);
    
    return { stream, contentType };
  }
}