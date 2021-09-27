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
  ): Promise<number> {
    const correctReq: PositionRequest = {
      coords: [long, lat],
      gpsPerturbated: false,
      dummyLocation: false,
    };

    if (!perturbatorEnabled && !dummyUpdatesEnabled)
      return (
        await this.trustedService.requestAverageNoises({
          positions: [correctReq],
          settings: {
            dummyUpdatesCount,
            dummyUpdatesRadiusMax,
            dummyUpdatesRadiusMin,
            perturbatorDecimals,
          },
        })
      )[0];

    const locations: PositionRequest[] = [];
    const correct = randomInt(0, dummyUpdatesCount - 1);

    for (let i = 0; i < dummyUpdatesCount; i++)
      if (correct === i) locations.push(correctReq);
      else {
        if (dummyUpdatesEnabled) {
          locations.push(
            this.trustedService.dummyPositionMaker(
              correctReq,
              dummyUpdatesRadiusMin,
              dummyUpdatesRadiusMax,
            ),
          );
          if (perturbatorEnabled)
            locations.push(
              this.trustedService.perturbate(
                locations[locations.length - 1],
                perturbatorDecimals,
              ),
            );
        }
        if (perturbatorEnabled)
          locations.push(
            this.trustedService.perturbate(correctReq, perturbatorDecimals),
          );
      }

    return (
      await this.trustedService.requestAverageNoises({
        positions: locations,
        settings: {
          dummyUpdatesCount,
          dummyUpdatesRadiusMax,
          dummyUpdatesRadiusMin,
          perturbatorDecimals,
        },
      })
    )[correct];

    // TODO cloaking
  }
}
