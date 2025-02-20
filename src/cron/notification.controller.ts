import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('test-email')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async testEmail() {
    await this.notificationService.handleDailyEmail();
    return 'E-mail de teste enviado!';
  }
}