import { DomainGeoJsonProperties } from './../../common/dtos/geojson.properties';
import { NoiseRequest } from './../../common/schemas/noise-request.entity';
import {
  PositionRequest,
  PrivacyPreferences,
} from '../../common/dtos/request.dto';
import { Injectable } from '@nestjs/common';
import { FeatureCollection, Point } from 'geojson';
import { NoiseRepository } from 'src/common/repo/noise-repository';
import { Noise } from 'src/common/schemas/noise.entity';
import { getCustomRepository, getRepository } from 'typeorm';

@Injectable()
export class LocationsService {
  async getAverageNoise(long: number, lat: number): Promise<number> {
    return await getCustomRepository(NoiseRepository).getAverage({
      lat,
      long,
    });
  }

  async getAllNoisesInArea(
    //           lon      lat
    southWest: [number, number], // min
    northEast: [number, number], // max
  ): Promise<FeatureCollection<Point>> {
    const res = await getCustomRepository(NoiseRepository).getAllNoisesInArea(
      southWest, //min
      northEast, //max
    );

    return {
      type: 'FeatureCollection',
      features: res.map((el) => {
        return {
          geometry: el.location,
          properties: {
            timestamp: el.timestamp,
            noise: el.noise,
          },
          type: 'Feature',
        };
      }),
    };
  }

  async countSamplesInArea(
    southWest: [number, number], // min
    northEast: [number, number], // max
  ) {
    return await getCustomRepository(NoiseRepository).countSamplesInArea(
      southWest, //min
      northEast, //max
    );
  }

  async getKmeansInArea(
    //           lon      lat
    southWest: [number, number], // min
    northEast: [number, number], // max
    k: number,
  ): Promise<FeatureCollection<Point>> {
    const res = await getCustomRepository(NoiseRepository).getKMeansInArea(
      southWest, //min
      northEast, //max
      k,
    );

    return {
      type: 'FeatureCollection',
      features: res.map((el) => {
        return {
          geometry: JSON.parse(el.locationString),
          properties: {
            cid: el.cid,
          },
          type: 'Feature',
        };
      }),
    };
  }

  async add(
    featuresCollection: FeatureCollection<Point, DomainGeoJsonProperties>,
  ) {
    await getRepository(Noise).save(
      featuresCollection.features.map(Noise.build),
    );
  }

  async logRequest(
    request: PositionRequest,
    privacyPreferences: PrivacyPreferences,
  ) {
    await getRepository(NoiseRequest).save(
      NoiseRequest.build(request, privacyPreferences),
    );
  }
}
