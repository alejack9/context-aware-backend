import { DbModule } from './../../db/db.module';
import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { FrontedRequestsController } from './fronted-requests.controller';

@Module({
  imports: [DbModule],
  controllers: [LocationsController, FrontedRequestsController],
  providers: [LocationsService],
})
export class LocationsModule {}
