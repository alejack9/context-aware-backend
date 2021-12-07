import { LocationsService } from './locations.service';
import {
  Controller,
  Get,
  Query,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  BackendPrivacyParameters,
  PrivacyOptions,
} from 'src/dtos/backend-privacy-parameters';

@Controller()
export class FrontedRequestsController {
  private readonly logger = new Logger('LocationController');

  constructor(private readonly locationsService: LocationsService) {}

  @Get('samplesInArea')
  async getSamplesInArea(
    // down left corner (min)
    @Query('swLong') swLong: number,
    @Query('swLat') swLat: number,
    // up right corner (max)
    @Query('neLong') neLong: number,
    @Query('neLat') neLat: number,
    @PrivacyOptions() privacyOptions: BackendPrivacyParameters,
  ) {
    return await this.locationsService.getAllNoisesInArea(
      [swLong, swLat], // min
      [neLong, neLat], // max
      privacyOptions,
    );
  }

  @Get('kmeansInArea')
  async getKmeansInArea(
    @Query('k') k: number,
    // down left corner (min)
    @Query('swLong') swLong: number,
    @Query('swLat') swLat: number,
    // up right corner (max)
    @Query('neLong') neLong: number,
    @Query('neLat') neLat: number,
    @PrivacyOptions() privacyOptions: BackendPrivacyParameters,
  ) {
    if (
      (await this.locationsService.countSamplesInArea(
        [swLong, swLat],
        [neLong, neLat],
        privacyOptions,
      )) < k
    )
      throw new BadRequestException('Not enough samples in selected area');
    return await this.locationsService.getKmeansInArea(
      [swLong, swLat], // min
      [neLong, neLat], // max
      privacyOptions,
      k,
    );
  }
}
