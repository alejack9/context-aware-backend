import { RequestParserPipe } from './../../common/pipes/request-parser.pipe';
import { RequestDto } from './../../common/dtos/request.dto';
import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { FeatureCollection, Point } from 'geojson';

@Controller('locations')
export class LocationsController {
  private readonly logger = new Logger('LocationController');

  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async getAverageNoises(
    @Query('requests', new RequestParserPipe()) request: RequestDto,
  ) {
    this.logger.log(`New multiple average noise request.`);

    return await Promise.all(
      request.positions.map(async (position) => {
        await this.locationsService.logRequest(position);
        return await this.locationsService.getAverageNoise(
          position.coords[0],
          position.coords[1],
        );
      }),
    );
  }

  @Post()
  async addFeatureCollection(@Body() featColl: FeatureCollection<Point>) {
    this.logger.log(`New FeatureCollection received.`);
    return await this.locationsService.add(featColl);
  }
}
