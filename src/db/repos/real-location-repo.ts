import { IRepository } from './repository.interface';
import { RealNoise } from './../schemas/real-noise.entity';
import { Repository, EntityRepository, InsertResult } from 'typeorm';
import {
  getAverageQuery,
  getKMeansInAreaQuery,
  insertQuery,
} from './utils/common-queries';

@EntityRepository(RealNoise)
export class RealLocationRepository
  extends Repository<RealNoise>
  implements IRepository<RealNoise>
{
  async getAverage(coordinates: {
    lat: number;
    long: number;
  }): Promise<number> {
    return (await getAverageQuery('real', this, coordinates).getRawOne()).avg;
  }

  async getAllNoisesInArea(
    sw: [number, number],
    ne: [number, number],
  ): Promise<RealNoise[]> {
    return await this.selectSamplesInAreaBuilder(sw, ne).getRawMany();
  }

  async countSamplesInArea(
    sw: [number, number],
    ne: [number, number],
  ): Promise<number> {
    return await this.selectSamplesInAreaBuilder(sw, ne).getCount();
  }

  async getKMeansInArea(
    sw: [number, number],
    ne: [number, number],
    k: number,
  ): Promise<{ cid: number; locationString: string }[]> {
    return await getKMeansInAreaQuery(this, sw, ne, k).getRawMany<{
      cid: number;
      locationString: string;
    }>();
  }

  private selectSamplesInAreaBuilder = (
    sw: [number, number], // min
    ne: [number, number], // max
  ) =>
    this.createQueryBuilder()
      .select(
        'timestamp, ST_AsGeoJSON(ST_Transform(location, 4326))::json AS location, noise',
      )
      .where(
        // 'location && ST_MakeEnvelope(12.961822467019473, 43.34242776649977,13.039337557957989, 43.311021473942844, 4326)',
        `location && ST_Transform(ST_SetSRID(ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat), 4326), 3857)`,
        {
          minLon: sw[0],
          minLat: sw[1],
          maxLon: ne[0],
          maxLat: ne[1],
        },
      );

  async customInsert(
    timestamp: Date,
    coordinates: number[],
    noise: number,
  ): Promise<InsertResult> {
    return await insertQuery(this, (query) =>
      query.values({
        timestamp,
        noise,
        location: () =>
          `ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON( '{ "type": "Point", "coordinates": [${coordinates}] }'), 4326), 3857)`,
      }),
    ).execute();
  }
}
