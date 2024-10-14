import { Controller, Get, Post, Query, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File): string {
    //console.log('controller: ' + file.originalname);
    return this.appService.uploadService(file);
  }

  @Get('file')
  getFile(@Query('fileName') fileName: string): StreamableFile {
    return this.appService.getFile(fileName);
  }
}
