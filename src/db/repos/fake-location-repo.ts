import { IRepository } from './repository.interface';
import {
  Repository,
  EntityRepository,
  BaseEntity,
  InsertResult,
} from 'typeorm';
import {
  getAverageQuery,
  getKMeansInAreaQuery,
  insertQuery,
} from './utils/common-queries';

@EntityRepository()
export class FakeLocationRepo<T extends BaseEntity>
  extends Repository<T>
  implements IRepository<T>
{
  async getAverage(coordinates: {
    lat: number;
    long: number;
  }): Promise<number> {
    return (
      await getAverageQuery('fake', this, coordinates)
        .innerJoin(`fake.real`, 'real')
        .getRawOne()
    ).avg;
  }

  async getAllNoisesInArea(
    //    lon      lat
    sw: [number, number], // min
    ne: [number, number], // max
  ): Promise<T[]> {
    return await this.selectSamplesInAreaBuilder(sw, ne)
      .innerJoin(`fake.real`, 'real')
      .getRawMany();
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
    this.createQueryBuilder('fake')
      .select(
        'real.timestamp, ST_AsGeoJSON(ST_Transform(fake.location, 4326))::json AS location, real.noise',
      )
      .where(
        // 'location && ST_MakeEnvelope(12.961822467019473, 43.34242776649977,13.039337557957989, 43.311021473942844, 4326)',
        `fake.location && ST_Transform(ST_SetSRID(ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat), 4326), 3857)`,
        {
          minLon: sw[0],
          minLat: sw[1],
          maxLon: ne[0],
          maxLat: ne[1],
        },
      );

  async customInsert(
    real_id: number,
    coordinates: number[],
  ): Promise<InsertResult> {
    return await insertQuery(this, (query) =>
      query.values({
        real: real_id,
        location: () =>
          `ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON( '{ "type": "Point", "coordinates": [${coordinates}] }'), 4326), 3857)`,
      }),
    ).execute();
  }
}
