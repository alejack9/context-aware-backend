import { EntityRepository, Repository } from 'typeorm';
import { Noise } from '../schemas/noise.entity';

@EntityRepository(Noise)
export class NoiseRepository extends Repository<Noise> {
  async getAverage(coordinates: {
    lat: number;
    long: number;
  }): Promise<number> {
    return (
      await this.createQueryBuilder('noise')
        .select('avg(noise) as "avg"')
        .where(
          'ST_DWithin(location, ST_MakePoint(:long , :lat)::geography, 3000)',
          {
            long: coordinates.long,
            lat: coordinates.lat,
          },
        )
        .getRawOne()
    ).avg;
  }

  async getAllNoisesInArea(
    //    lon      lat
    sw: [number, number], // min
    ne: [number, number], // max
  ): Promise<Noise[]> {
    return await this.createQueryBuilder('noise')
      .where(
        // 'location && ST_MakeEnvelope(12.961822467019473, 43.34242776649977,13.039337557957989, 43.311021473942844, 4326)',
        'location && ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326)',
        {
          minLon: sw[0],
          minLat: sw[1],
          maxLon: ne[0],
          maxLat: ne[1],
        },
      )
      .getMany();
  }

  async getKMeansInArea(
    //    lon      lat
    sw: [number, number], // min
    ne: [number, number], // max
  ): Promise<{ cid: number; locationString: string }[]> {
    return await this.createQueryBuilder('noise')
      .select(
        'ST_ClusterKMeans(location, 4) OVER() AS cid, ST_AsGeoJSON(location) AS "locationString"',
      )
      .where(
        // 'location && ST_MakeEnvelope(12.961822467019473, 43.34242776649977,13.039337557957989, 43.311021473942844, 4326)',
        'location && ST_MakeEnvelope(:minlon, :minlat, :maxlon, :maxlat, 4326)',
        {
          minlon: sw[0],
          minlat: sw[1],
          maxlon: ne[0],
          maxlat: ne[1],
        },
      )
      .getRawMany<{ cid: number; locationString: string }>();
  }

  // save<T extends DeepPartial<Noise>>(
  //   entity: T & { id?: number },
  //   options?: SaveOptions,
  // ): Promise<T> {
  //   console.log(`saving ${entity}`);
  //   // @ts-ignore
  //   if (!entity.id) return this.create(entity);
  //   // @ts-ignore
  //   else return this.update(entity._id, entity);
  // }
}
