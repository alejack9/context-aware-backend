import { NoiseRequest } from './../../common/schemas/noise-request.entity';
import { RequestPosition } from '../../common/dtos/request.dto';
import { Injectable } from '@nestjs/common';
import { FeatureCollection, Point } from 'geojson';
import { NoiseRepository } from 'src/common/repo/noise-repository';
import { Noise } from 'src/common/schemas/noise.entity';
import { getCustomRepository, getRepository } from 'typeorm';

@Injectable()
export class LocationsService {
  async getAverageNoise(long: number, lat: number) {
    return await getCustomRepository(NoiseRepository).getAverage({
      lat,
      long,
    });
  }

  async add(featuresCollection: FeatureCollection<Point>) {
    await getRepository(Noise).save(
      featuresCollection.features.map(Noise.build),
    );
  }

  async logRequest(request: RequestPosition) {
    await getRepository(NoiseRequest).save(NoiseRequest.build(request));
  }
}
