import {
  countDecimals,
  round,
  randomInt,
  randomDouble,
} from './../../common/utils/math';
import { RequestDto, PositionRequest } from './../../common/dtos/request.dto';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TrustedService {
  private readonly logger = new Logger('TrustedService');
  constructor(private http: HttpService) {}

  perturbate(
    location: PositionRequest,
    realDecimalDigits: number,
  ): PositionRequest {
    return {
      dummyLocation: location.dummyLocation,
      gpsPerturbated: true,
      coords: location.coords.map((coord) => {
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
      }),
    };
  }

  dummyPositionMaker(
    location: PositionRequest,
    min_radius: number,
    max_radius: number,
  ): PositionRequest {
    // Random angle from 0 to 3.14
    const theta = randomDouble(0, 2 * Math.PI);
    // Get x and y (sin and cos) change distance from point of a max of DUMMY_MAX_RADIUS
    const offset = [Math.sin(theta), Math.cos(theta)].map(
      (x) => x * randomDouble(min_radius, max_radius),
    );
    return {
      coords: location.coords.map((v, i) => v + offset[i]),
      dummyLocation: true,
      gpsPerturbated: false,
    };
  }

  async requestAverageNoises(dto: RequestDto): Promise<number[]> {
    return (
      await this.http
        .get(
          `https://context-aware-backend.herokuapp.com/locations?requests=${JSON.stringify(
            dto,
          )}`,
        )
        .toPromise()
    ).data;
  }
}
