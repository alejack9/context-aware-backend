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

  @Get('samplesInArea')
  async getSamplesInArea(
    // down left cornel (min)
    @Query('swLong') swLongString: string,
    @Query('swLat') swLatString: string,
    // up right cornel (max)
    @Query('neLong') neLongString: string,
    @Query('neLat') neLatsString: string,
  ) {
    return await this.locationsService.getAllNoisesInArea(
      [parseFloat(swLongString), parseFloat(swLatString)], // min
      [parseFloat(neLongString), parseFloat(neLatsString)], // max
    );
  }

  @Get('kmeansInArea')
  async getKmeansInArea(
    // down left corner (min)
    @Query('swLong') swLongString: string,
    @Query('swLat') swLatString: string,
    // up right corner (max)
    @Query('neLong') neLongString: string,
    @Query('neLat') neLatsString: string,
  ) {
    return await this.locationsService.getKmeansInArea(
      [parseFloat(swLongString), parseFloat(swLatString)], // min
      [parseFloat(neLongString), parseFloat(neLatsString)], // max
    );
  }

  @Get('samplesInArea')
  async getSamplesInArea(
    // down left cornel (min)
    @Query('swLong') swLongString: string,
    @Query('swLat') swLatString: string,
    // up right cornel (max)
    @Query('neLong') neLongString: string,
    @Query('neLat') neLatsString: string,
  ) {
    return await this.locationsService.getAllNoisesInArea(
      [parseFloat(swLongString), parseFloat(swLatString)], // min
      [parseFloat(neLongString), parseFloat(neLatsString)], // max
    );
  }

  @Get('kmeansInArea')
  async getKmeansInArea(
    // down left corner (min)
    @Query('swLong') swLongString: string,
    @Query('swLat') swLatString: string,
    // up right corner (max)
    @Query('neLong') neLongString: string,
    @Query('neLat') neLatsString: string,
  ) {
    return await this.locationsService.getKmeansInArea(
      [parseFloat(swLongString), parseFloat(swLatString)], // min
      [parseFloat(neLongString), parseFloat(neLatsString)], // max
    );
  }

  @Post()
  async addFeatureCollection(@Body() featColl: FeatureCollection<Point>) {
    this.logger.log(`New FeatureCollection received.`);
    return await this.locationsService.add(featColl);
  }
}
