import { DomainGeoJsonProperties } from './../../common/dtos/geojson.properties';
import { FeatureCollection, Point } from 'geojson';
import {
  countDecimals,
  round,
  randomInt,
  randomDouble,
} from './../../common/utils/math';
import { PositionRequest, buildDto } from './../../common/dtos/request.dto';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

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
          `https://context-aware-backend.herokuapp.com/locations?requests=${JSON.stringify(
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

  async addNoise(
    featureCollection: FeatureCollection<Point, DomainGeoJsonProperties>,
  ) {
    return (
      await this.http
        .post('http://10.8.0.2:3000/locations', featureCollection)
        .toPromise()
    ).data;
  }
}
