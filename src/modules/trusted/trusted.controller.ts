import { logSend, logProgress } from './../../common/utils/log-utils';
import waitForPromises from '../../common/utils/promises-waiter';
import { randomInt } from './../../common/utils/math';
import { TrustedService } from './trusted.service';
import * as defaultPrivacyParameters from './../../common/default-privacy-parameters';
import { product } from 'cartesian-product-generator';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  ParseBoolPipe,
  ParseFloatPipe,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { PositionRequest } from 'src/common/dtos/request.dto';
import { FeatureCollection, Point, Feature } from 'geojson';
import { DomainGeoJsonProperties } from 'src/common/dtos/geojson.properties';

@Controller('trusted')
export class TrustedController {
  private readonly logger = new Logger('TrustedController');
  // private readonly trueFeaturesLogger = new Logger('TrueFeaturesInsertion');

  constructor(private trustedService: TrustedService) {}

  private getCoords(
    base: number[],
    dummyUpdatesCount: number,
    dummyUpdatesEnabled: boolean,
    perturbatorEnabled: boolean,
    dummyUpdatesRadiusMin: number,
    dummyUpdatesRadiusMax: number,
    perturbatorDecimals: number,
  ): {
    dummyUpdatesOnly: number[][];
    gpsPerturbatedOnly: number[][];
    dummyUpdatesAndGpsPerturbated: number[][];
  } {
    const dummyUpdatesOnly: number[][] = [];
    const gpsPerturbatedOnly: number[][] = [];
    const dummyUpdatesAndGpsPerturbated: number[][] = [];

    for (let i = 0; i < dummyUpdatesCount - 1; i++)
      if (dummyUpdatesEnabled) {
        dummyUpdatesOnly.push(
          this.trustedService.dummyPositionMakerFromCoord(
            [base, ...dummyUpdatesOnly][randomInt(0, dummyUpdatesOnly.length)],
            dummyUpdatesRadiusMin,
            dummyUpdatesRadiusMax,
          ),
        );
        if (perturbatorEnabled)
          dummyUpdatesAndGpsPerturbated.push(
            this.trustedService.perturbateCoords(
              [base, ...dummyUpdatesAndGpsPerturbated][
                randomInt(0, dummyUpdatesAndGpsPerturbated.length)
              ],
              perturbatorDecimals,
            ),
          );
      }
    if (perturbatorEnabled)
      gpsPerturbatedOnly.push(
        this.trustedService.perturbateCoords(base, perturbatorDecimals),
      );

    return {
      dummyUpdatesOnly,
      gpsPerturbatedOnly,
      dummyUpdatesAndGpsPerturbated,
    };
  }

  @Get()
  async getAverageNoise(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('long', ParseFloatPipe) long: number,
    @Query(
      'perturbatorEnabled',
      new DefaultValuePipe(defaultPrivacyParameters.perturbatorEnabled),
      ParseBoolPipe,
    )
    perturbatorEnabled?: boolean,
    @Query(
      'perturbatorDecimals',
      new DefaultValuePipe(defaultPrivacyParameters.perturbatorDecimals),
      ParseIntPipe,
    )
    perturbatorDecimals?: number,
    @Query(
      'dummyUpdatesEnabled',
      new DefaultValuePipe(defaultPrivacyParameters.dummyUpdatesEnabled),
      ParseBoolPipe,
    )
    dummyUpdatesEnabled?: boolean,
    @Query(
      'dummyUpdatesCount',
      new DefaultValuePipe(defaultPrivacyParameters.dummyUpdatesCount),
      ParseIntPipe,
    )
    dummyUpdatesCount?: number,
    @Query(
      'dummyUpdatesRadiusMin',
      new DefaultValuePipe(defaultPrivacyParameters.dummyUpdatesRadiusMin),
      ParseFloatPipe,
    )
    dummyUpdatesRadiusMin?: number,
    @Query(
      'dummyUpdatesRadiusMax',
      new DefaultValuePipe(defaultPrivacyParameters.dummyUpdatesRadiusMax),
      ParseFloatPipe,
    )
    dummyUpdatesRadiusMax?: number,
  ): Promise<number> {
    const correctCoords = [long, lat];

    if (!perturbatorEnabled && !dummyUpdatesEnabled)
      return (
        await this.trustedService.requestAverageNoises(
          [
            {
              coords: correctCoords,
              gpsPerturbated: false,
              dummyLocation: false,
            },
          ],
          dummyUpdatesCount,
          dummyUpdatesRadiusMax,
          dummyUpdatesRadiusMin,
          perturbatorDecimals,
        )
      )[0];

    const fakeCoordsObj = this.getCoords(
      correctCoords,
      dummyUpdatesCount,
      dummyUpdatesEnabled,
      perturbatorEnabled,
      dummyUpdatesRadiusMin,
      dummyUpdatesRadiusMax,
      perturbatorDecimals,
    );

    const fakeCoords: PositionRequest[] = [
      ...fakeCoordsObj.dummyUpdatesOnly.map((coords) => {
        return {
          dummyLocation: true,
          gpsPerturbated: false,
          coords,
        };
      }),
      ...fakeCoordsObj.gpsPerturbatedOnly.map((coords) => {
        return {
          dummyLocation: false,
          gpsPerturbated: true,
          coords,
        };
      }),
      ...fakeCoordsObj.dummyUpdatesAndGpsPerturbated.map((coords) => {
        return {
          dummyLocation: true,
          gpsPerturbated: true,
          coords,
        };
      }),
    ];

    // TODO cloaking

    const correct = randomInt(0, fakeCoords.length - 1);
    fakeCoords.splice(correct, 0, {
      coords: correctCoords,
      dummyLocation: false,
      gpsPerturbated: false,
    });

    return (
      await this.trustedService.requestAverageNoises(
        fakeCoords,
        dummyUpdatesCount,
        dummyUpdatesRadiusMax,
        dummyUpdatesRadiusMin,
        perturbatorDecimals,
      )
    )[correct];
  }

  // private req = 0;
  // private trueFeaturesAdded = 0;

  @Post()
  async addFeatureCollection(
    @Body()
    featColl: FeatureCollection<Point, DomainGeoJsonProperties>,
  ) {
    // const requestId = this.req++;
    const currentHyperparamsLength =
      defaultPrivacyParameters.hyperparamsLength * featColl.features.length;
    this.logger.log('New trusted position requested.');
    let i = 0;
    const proms: Promise<void>[] = [];

    for (const feature of featColl.features) {
      const featureMaker = this.trustedService.createFeatureFunction(feature);
      await this.trustedService.addNoise({
        type: 'FeatureCollection',
        features: [
          featureMaker(
            feature.geometry.coordinates,
            false,
            false,
            defaultPrivacyParameters.dummyUpdatesRadiusMin[0],
            defaultPrivacyParameters.dummyUpdatesRadiusMax[0],
            defaultPrivacyParameters.perturbatorDecimals[0],
          ),
        ],
      });
      // this.trueFeaturesLogger.log(
      //   `${++this.trueFeaturesAdded} true features added`,
      // );

      const hyperParams = product(
        defaultPrivacyParameters.perturbatorDecimals,
        defaultPrivacyParameters.dummyUpdatesRadiusMin,
        defaultPrivacyParameters.dummyUpdatesRadiusMax,
      );

      for (const [pertDecimals, dumUpRadMin, dumUpRadMax] of hyperParams) {
        const fakeCoordsObj = this.getCoords(
          feature.geometry.coordinates,
          feature.properties.dummyUpdatesCount,
          // feature.properties.dummyLocation,
          // feature.properties.gpsPerturbated,
          true,
          true,
          dumUpRadMin,
          dumUpRadMax,
          pertDecimals,
        );

        const featuresMaker = this.trustedService.makeFeaturesFunctionMaker(
          featureMaker,
          dumUpRadMin,
          dumUpRadMax,
          pertDecimals,
        );

        // put features together in features collection
        const featureCollection: FeatureCollection<
          Point,
          DomainGeoJsonProperties
        > = {
          type: 'FeatureCollection',
          features: [
            ...featuresMaker(fakeCoordsObj.dummyUpdatesOnly, true, false),
            ...featuresMaker(fakeCoordsObj.gpsPerturbatedOnly, false, true),
            ...featuresMaker(
              fakeCoordsObj.dummyUpdatesAndGpsPerturbated,
              true,
              true,
            ),
          ],
        };

        // logSend(this.logger, requestId, ++i, currentHyperparamsLength);
        logSend(this.logger, ++i, currentHyperparamsLength);
        proms.push(this.trustedService.addNoise(featureCollection));
      }
    }
    await waitForPromises(
      (cur, tot) => logProgress(this.logger, cur, tot),
      proms,
    );
    this.logger.log(`End sending.`);
    // await waitForReciving((cur, tot) => logProgress(this.logger,requestId, cur, tot), proms);
    // this.logger.log(`${requestId} - End sending.`);
  }
}
