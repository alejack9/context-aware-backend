import { Controller, Get } from '@nestjs/common';

@Controller('')
export class RootController {
  @Get('ping')
  ping() {
    return 'pong';
  }
}
