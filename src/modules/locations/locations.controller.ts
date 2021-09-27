import { JsonParserPipe } from '../../common/pipes/json-parser.pipe';
import { RequestDto } from './../../common/dtos/request.dto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { FeatureCollection, Point } from 'geojson';

@Controller('locations')
export class LocationsController {
  private readonly logger = new Logger('LocationController');

  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async getAverageNoises(
    @Query('requests', new JsonParserPipe()) request: RequestDto,
  ): Promise<number[]> {
    this.logger.log(`New multiple average noise request.`);

    return await Promise.all(
      request.positions.map(async (position) => {
        await this.locationsService.logRequest(position, request.settings);
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
    @Query('swLong') swLong: number,
    @Query('swLat') swLat: number,
    // up right cornel (max)
    @Query('neLong') neLong: number,
    @Query('neLat') neLats: number,
  ) {
    return await this.locationsService.getAllNoisesInArea(
      [swLong, swLat], // min
      [neLong, neLats], // max
    );
  }

  @Get('kmeansInArea')
  async getKmeansInArea(
    @Query('k') k: number,
    // down left corner (min)
    @Query('swLong') swLongString: number,
    @Query('swLat') swLatString: number,
    // up right corner (max)
    @Query('neLong') neLongString: number,
    @Query('neLat') neLatsString: number,
  ) {
    if (
      (await this.locationsService.countSamplesInArea(
        [swLongString, swLatString],
        [neLongString, neLatsString],
      )) < k
    )
      throw new BadRequestException('Not enough samples in selected area');

    return await this.locationsService.getKmeansInArea(
      [swLongString, swLatString], // min
      [neLongString, neLatsString], // max
      k,
    );
  }

  @Post()
  async addFeatureCollection(@Body() featColl: FeatureCollection<Point>) {
    this.logger.log(`New FeatureCollection received.`);
    return await this.locationsService.add(featColl);
  }
}
