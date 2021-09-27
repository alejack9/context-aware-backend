import { RequestDto } from './../../common/dtos/request.dto';
import { randomInt } from './../../common/utils/math';
import { TrustedService } from './trusted.service';
import {
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  ParseBoolPipe,
  ParseFloatPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PositionRequest } from 'src/common/dtos/request.dto';

@Controller('trusted')
export class TrustedController {
  private readonly logger = new Logger('TrustedController');
  constructor(private trustedService: TrustedService) {}

  @Get()
  async getAverageNoise(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('long', ParseFloatPipe) long: number,
    @Query('perturbatorEnabled', new DefaultValuePipe(false), ParseBoolPipe)
    perturbatorEnabled?: boolean,
    @Query('perturbatorDecimals', new DefaultValuePipe(3), ParseIntPipe)
    perturbatorDecimals?: number,
    @Query('dummyUpdatesEnabled', new DefaultValuePipe(false), ParseBoolPipe)
    dummyUpdatesEnabled?: boolean,
    @Query('dummyUpdatesCount', new DefaultValuePipe(10), ParseIntPipe)
    dummyUpdatesCount?: number,
    @Query(
      'dummyUpdatesRadiusMin',
      new DefaultValuePipe(0.0005),
      ParseFloatPipe,
    )
    dummyUpdatesRadiusMin?: number,
    @Query('dummyUpdatesRadiusMax', new DefaultValuePipe(0.004), ParseFloatPipe)
    dummyUpdatesRadiusMax?: number,
  ) {
    const coords = [lat, long];

    const correctReq: PositionRequest = {
      coords,
      gpsPerturbated: false,
      dummyLocation: false,
    };

    const locations: PositionRequest[] = [];
    let correct = 0;

    if (perturbatorEnabled || dummyUpdatesEnabled) {
      correct = randomInt(0, dummyUpdatesCount - 1);

      for (let i = 0; i < dummyUpdatesCount; i++) {
        if (correct !== i) {
          if (dummyUpdatesEnabled)
            locations.push(
              this.trustedService.dummyPositionMaker(
                correctReq,
                dummyUpdatesRadiusMin,
                dummyUpdatesRadiusMax,
              ),
            );
          if (perturbatorEnabled) {
            if (dummyUpdatesEnabled)
              locations.push(
                this.trustedService.perturbate(
                  locations[locations.length - 1],
                  perturbatorDecimals,
                ),
              );

            locations.push(
              this.trustedService.perturbate(correctReq, perturbatorDecimals),
            );
          }
        } else locations.push(correctReq);
      }
    } else locations.push(correctReq);

    const req: RequestDto = {
      positions: locations,
      settings: {
        dummyUpdatesCount,
        dummyUpdatesRadiusMax,
        dummyUpdatesRadiusMin,
        perturbatorDecimals,
      },
    };

    return (await this.trustedService.requestAverageNoises(req))[correct];

    // mix-up and request to getAverageNoises of the location module through http service
  }
}
