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

  async add(featuresCollection: FeatureCollection<Point>) {
    return await getRepository(Noise).save(
      featuresCollection.features.map(Noise.build),
    );
  }
}
