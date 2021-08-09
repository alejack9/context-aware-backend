import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { FeatureCollection, Point } from 'geojson';
import { Response } from 'express';

@Controller('locations')
export class LocationsController {
  private readonly logger = new Logger('LocationController');

  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async getAverageNoise(
    @Query('lat') lat: number,
    @Query('long') long: number,
    @Res() res: Response,
  ) {
    this.logger.log('Gotcha new average noise request!!!');
    this.logger.log(`${lat} / ${long}`);
    const toRet = await this.locationsService.getAverageNoise(lat, long);
    this.logger.log(toRet);
    if (toRet) return toRet;
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  @Post()
  async addFeatureCollection(@Body() featColl: FeatureCollection<Point>) {
    this.logger.log('New FeatureCollection received!');
    return await this.locationsService.add(featColl);
  }
}
