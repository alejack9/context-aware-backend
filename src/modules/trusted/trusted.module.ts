import { TrustedService } from './trusted.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TrustedController } from './trusted.controller';

@Module({
  imports: [HttpModule],
  providers: [TrustedService],
  controllers: [TrustedController],
})
export class TrustedModule {}
