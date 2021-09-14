import {
  BadRequestException,
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
  async getAverageNoises(
    @Query('lats') latsString: string,
    @Query('longs') longsString: string,
  ) {
    let lats: number[], longs: number[];
    try {
      lats = latsString.split(',').map((i) => +i);
      longs = longsString.split(',').map((i) => +i);
    } catch {
      throw new BadRequestException('Not all passed values are numbers.');
    }
    if (lats.length !== longs.length)
      throw new BadRequestException(
        'latitudes and logitudes must be the same quantity',
      );
    this.logger.log(`New multiple average noise request.`);
    const toRet = await Promise.all(
      lats.map(
        async (lat, i) =>
          await this.locationsService.getAverageNoise(lat, longs[i]),
      ),
    );
    return toRet;
  }

  @Get('all')
  async getAllNoises() {
    return await this.locationsService.getAllNoises();
  }

  @Post()
  async addFeatureCollection(@Body() featColl: FeatureCollection<Point>) {
    this.logger.log(`New FeatureCollection received.`);
    return await this.locationsService.add(featColl);
  }
}
