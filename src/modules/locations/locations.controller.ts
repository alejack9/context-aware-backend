import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { FeatureCollection, Point } from 'geojson';

@Controller('locations')
export class LocationsController {
  private readonly logger = new Logger('LocationController');

  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async getAverageNoise(
    @Query('lat') lat: number,
    @Query('long') long: number,
  ) {
    this.logger.log(`New average noise request from: ${lat},${long}.`);
    return await this.locationsService.getAverageNoise(lat, long);
  }

  @Post()
  async addFeatureCollection(@Body() featColl: FeatureCollection<Point>) {
    this.logger.log(`New FeatureCollection received.`);
    return await this.locationsService.add(featColl);
  }
}
