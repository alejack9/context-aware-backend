import { Injectable } from '@nestjs/common';
import { FeatureCollection, Point } from 'geojson';
import { NoiseRepository } from 'src/common/repo/noise-repository';
import { Noise } from 'src/common/schemas/noise.entity';
import { getCustomRepository, getRepository } from 'typeorm';

@Injectable()
export class LocationsService {
  async getAverageNoise(lat: number, long: number) {
    return await getCustomRepository(NoiseRepository).getAverage({
      lat,
      long,
    });
  }

  async getAllNoisesInArea(
    //           lon      lat
    southWest: [number, number], // min
    northEast: [number, number], // max
  ) {
    return await getCustomRepository(NoiseRepository).getAllNoisesInArea(
      southWest, //min
      northEast, //max
    );
  }

  async getKmeansInArea(
    //           lon      lat
    southWest: [number, number], // min
    northEast: [number, number], // max
  ): Promise<FeatureCollection<Point>> {
    const res = await getCustomRepository(NoiseRepository).getKMeansInArea(
      southWest, //min
      northEast, //max
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

  async add(featuresCollection: FeatureCollection<Point>) {
    return await getRepository(Noise).save(
      featuresCollection.features.map(Noise.build),
    );
  }
}
