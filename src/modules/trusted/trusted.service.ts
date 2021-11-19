import { DomainGeoJsonProperties } from './../../common/dtos/geojson.properties';
import { Feature, FeatureCollection, Point } from 'geojson';
import {
  countDecimals,
  round,
  randomInt,
  randomDouble,
} from './../../common/utils/math';
import { PositionRequest, buildDto } from './../../common/dtos/request.dto';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

type featureMakerType = (
  coords: number[],
  dummyLocation: boolean,
  gpsPerturbated: boolean,
  dummyUpdatesRadiusMin: number,
  dummyUpdatesRadiusMax: number,
  perturbatorDecimals: number,
) => Feature<Point, DomainGeoJsonProperties>;

@Injectable()
export class TrustedService {
  private readonly logger = new Logger('TrustedService');
  constructor(private http: HttpService) {}

  perturbateCoords(coords: number[], realDecimalDigits: number) {
    return coords.map((coord) => {
      const decimalsDigits = countDecimals(coord);
      const fakeDigits = decimalsDigits - realDecimalDigits;

      const realPart = round(coord, realDecimalDigits);
      const fakePart = randomInt(
        Math.pow(10, fakeDigits - 2),
        Math.pow(10, fakeDigits - 1) - 1,
      );

      const res =
        realPart +
        Math.pow(10, -(decimalsDigits - 1)) * fakePart +
        Math.pow(10, -decimalsDigits) * randomInt(1, 9);

      return round(res, decimalsDigits);
    });
  }

  dummyPositionMakerFromCoord(
    coords: number[],
    min_radius: number,
    max_radius: number,
  ) {
    // Random angle from 0 to 3.14
    const theta = randomDouble(0, 2 * Math.PI);
    // Get x and y (sin and cos) change distance from point of a max of DUMMY_MAX_RADIUS
    const offset = [Math.sin(theta), Math.cos(theta)].map(
      (x) => x * randomDouble(min_radius, max_radius),
    );
    return coords.map((v, i) => v + offset[i]);
  }

  async requestAverageNoises(
    positions: PositionRequest[],
    dummyUpdatesCount: number,
    dummyUpdatesRadiusMax: number,
    dummyUpdatesRadiusMin: number,
    perturbatorDecimals: number,
  ): Promise<number[]> {
    return (
      await this.http
        .get(
          `${process.env.UNTRUSTED_BACKEND}/locations?requests=${JSON.stringify(
            buildDto(
              positions,
              dummyUpdatesCount,
              dummyUpdatesRadiusMax,
              dummyUpdatesRadiusMin,
              perturbatorDecimals,
            ),
          )}`,
        )
        .toPromise()
    ).data;
  }

  private waitFor = async (num: number) =>
    new Promise((res) => setTimeout(() => res(null), num));

  async addNoise(
    featureCollection: FeatureCollection<Point, DomainGeoJsonProperties>,
  ): Promise<void> {
    let done = true;
    do {
      try {
        (
          await this.http
            .post(
              `${process.env.UNTRUSTED_BACKEND}/locations`,
              featureCollection,
            )
            .toPromise()
        ).data;
        done = true;
      } catch (e: any) {
        done = false;
        this.logger.error(e);
        this.logger.log('retrying in 500 ms');
        await this.waitFor(500);
      }
    } while (!done);
  }

  createFeatureFunction(
    feature: Feature<Point, DomainGeoJsonProperties>,
  ): featureMakerType {
    return (
      coords: number[],
      dummyLocation: boolean,
      gpsPerturbated: boolean,
      dummyUpdatesRadiusMin: number,
      dummyUpdatesRadiusMax: number,
      perturbatorDecimals: number,
    ): Feature<Point, DomainGeoJsonProperties> => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coords,
        },
        properties: {
          dummyLocation,
          dummyUpdatesCount: feature.properties.dummyUpdatesCount,
          dummyUpdatesRadiusMax,
          dummyUpdatesRadiusMin,
          gpsPerturbated,
          noiseLevel: feature.properties.noiseLevel,
          perturbatorDecimals,
          timeStamp: feature.properties.timeStamp,
        },
      };
    };
  }

  makeFeaturesFunctionMaker(
    featureMaker: featureMakerType,
    dummyUpdatesRadiusMin: number,
    dummyUpdatesRadiusMax: number,
    perturbatorDecimals: number,
  ) {
    return (
      coords: number[][],
      dummyLocation: boolean,
      gpsPerturbated: boolean,
    ) =>
      coords.map<Feature<Point, DomainGeoJsonProperties>>((coords) =>
        featureMaker(
          coords,
          dummyLocation,
          gpsPerturbated,
          dummyUpdatesRadiusMin,
          dummyUpdatesRadiusMax,
          perturbatorDecimals,
        ),
      );
  }
}
