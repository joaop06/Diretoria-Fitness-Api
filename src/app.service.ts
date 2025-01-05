import { Injectable } from '@nestjs/common';
import { SystemLogsService } from './modules/system-logs/system-logs.service';

@Injectable()
export class AppService {
  constructor(private systemLogsService: SystemLogsService) { }

  getHello(): string {
    const message = 'Hello World!';
    this.systemLogsService.upsert({
      message,
      source: 'AppService.getHello',
    });
    return message;
  }
}
