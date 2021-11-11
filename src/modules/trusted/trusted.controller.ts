import { randomInt } from './../../common/utils/math';
import { TrustedService } from './trusted.service';
import * as defaultPrivacyParameters from './../../common/default-privacy-parameters';
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

  @Post()
  async addFeatureCollection(
    @Body()
    featColl: FeatureCollection<Point, DomainGeoJsonProperties>,
  ) {
    await defaultPrivacyParameters.perturbatorDecimals.forEach((pd) => {
      defaultPrivacyParameters.dummyUpdatesRadiusMin.forEach((dum) => {
        defaultPrivacyParameters.dummyUpdatesRadiusMax.forEach((duM) => {
          // foreach feature create a feature collection following privacy settings and it to backend
          for (const feature of featColl.features) {
            // 1- create features
            const fakeCoordsObj = this.getCoords(
              feature.geometry.coordinates,
              feature.properties.dummyUpdatesCount,
              feature.properties.dummyLocation,
              feature.properties.gpsPerturbated,
              dum,
              duM,
              pd,
            );

            const features: Feature<Point, DomainGeoJsonProperties>[] = [
              ...fakeCoordsObj.dummyUpdatesOnly.map<
                Feature<Point, DomainGeoJsonProperties>
              >((coords) => {
                return {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: coords,
                  },
                  properties: {
                    dummyLocation: true,
                    dummyUpdatesCount: feature.properties.dummyUpdatesCount,
                    dummyUpdatesRadiusMax: dum,
                    dummyUpdatesRadiusMin: duM,
                    gpsPerturbated: false,
                    noiseLevel: feature.properties.noiseLevel,
                    perturbatorDecimals: pd,
                    timeStamp: feature.properties.timeStamp,
                  },
                };
              }),
              ...fakeCoordsObj.gpsPerturbatedOnly.map<
                Feature<Point, DomainGeoJsonProperties>
              >((coords) => {
                return {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: coords,
                  },
                  properties: {
                    dummyLocation: false,
                    dummyUpdatesCount: feature.properties.dummyUpdatesCount,
                    dummyUpdatesRadiusMax: dum,
                    dummyUpdatesRadiusMin: duM,
                    gpsPerturbated: true,
                    noiseLevel: feature.properties.noiseLevel,
                    perturbatorDecimals: pd,
                    timeStamp: feature.properties.timeStamp,
                  },
                };
              }),
              ...fakeCoordsObj.dummyUpdatesAndGpsPerturbated.map<
                Feature<Point, DomainGeoJsonProperties>
              >((coords) => {
                return {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: coords,
                  },
                  properties: {
                    dummyLocation: true,
                    dummyUpdatesCount: feature.properties.dummyUpdatesCount,
                    dummyUpdatesRadiusMax: dum,
                    dummyUpdatesRadiusMin: duM,
                    gpsPerturbated: true,
                    noiseLevel: feature.properties.noiseLevel,
                    perturbatorDecimals: pd,
                    timeStamp: feature.properties.timeStamp,
                  },
                };
              }),
            ];

            features.splice(randomInt(0, features.length), 0, {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: feature.geometry.coordinates,
              },
              properties: {
                dummyLocation: false,
                dummyUpdatesCount: feature.properties.dummyUpdatesCount,
                dummyUpdatesRadiusMax: dum,
                dummyUpdatesRadiusMin: duM,
                gpsPerturbated: false,
                noiseLevel: feature.properties.noiseLevel,
                perturbatorDecimals: pd,
                timeStamp: feature.properties.timeStamp,
              },
            });

            // 2- put them together in feature collections
            const featureCollection: FeatureCollection<
              Point,
              DomainGeoJsonProperties
            > = {
              type: 'FeatureCollection',
              features: features,
            };

            // 3- foreach feature collection send to server
            this.trustedService.addNoise(featureCollection);
          }
        });
      });
    });
  }
}
