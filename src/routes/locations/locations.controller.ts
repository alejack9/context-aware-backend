import { LocationsService } from './locations.service';

import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { FeatureCollection, Point } from 'geojson';
import {
  BackendPrivacyParameters,
  PrivacyOptions,
} from 'src/dtos/backend-privacy-parameters';
import { BackendGeoJsonProperties } from 'src/dtos/backend-geojson-properties';

@Controller()
export class LocationsController {
  private readonly logger = new Logger('LocationController');

  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async getAverageNoise(
    @Query('lat') lat: number,
    @Query('long') long: number,
    @PrivacyOptions() privacyOptions: BackendPrivacyParameters,
  ): Promise<number> {
    this.logger.log(`New average noise request.`);
    return await this.locationsService.getAverageNoise(
      long,
      lat,
      privacyOptions,
    );
  }

  @Post()
  async addFeatureCollection(
    @Body()
    featColl: FeatureCollection<Point, BackendGeoJsonProperties>,
  ) {
    this.logger.log(`New FeatureCollection received.`);
    return await this.locationsService.add(featColl);
  }
}
