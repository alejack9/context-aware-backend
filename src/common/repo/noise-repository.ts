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
    dummyUpdates: boolean,
    gpsPerturbated: boolean,
  ): Promise<Noise[]> {
    return await this.selectSamplesInAreaBuilder(
      sw,
      ne,
      dummyUpdates,
      gpsPerturbated,
    ).getMany();
  }

  async countSamplesInArea(
    sw: [number, number], // min
    ne: [number, number], // max
    dummyUpdates: boolean,
    gpsPerturbated: boolean,
  ) {
    return await this.selectSamplesInAreaBuilder(
      sw,
      ne,
      dummyUpdates,
      gpsPerturbated,
    ).getCount();
  }

  private selectSamplesInAreaBuilder = (
    sw: [number, number], // min
    ne: [number, number], // max
    dummyUpdates: boolean,
    gpsPerturbated: boolean,
  ) =>
    this.createQueryBuilder('noise').where(
      // 'location && ST_MakeEnvelope(12.961822467019473, 43.34242776649977,13.039337557957989, 43.311021473942844, 4326)',
      `location && ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326)
        AND (
          ("dummyLocation"=:dum AND "gpsPerturbated"=:pert)
          OR ("dummyLocation" = false AND "gpsPerturbated" = false)
        )`,
      {
        minLon: sw[0],
        minLat: sw[1],
        maxLon: ne[0],
        maxLat: ne[1],
        dum: dummyUpdates,
        pert: gpsPerturbated,
      },
    );

  async getKMeansInArea(
    //    lon      lat
    sw: [number, number], // min
    ne: [number, number], // max
    dummyUpdates: boolean,
    gpsPerturbated: boolean,
    k: number,
  ): Promise<{ cid: number; locationString: string }[]> {
    return await this.createQueryBuilder('noise')
      .select(
        `ST_ClusterKMeans(location, ${k}) OVER() AS cid, ST_AsGeoJSON(location) AS "locationString"`,
      )
      .where(
        // 'location && ST_MakeEnvelope(12.961822467019473, 43.34242776649977,13.039337557957989, 43.311021473942844, 4326)',
        `location && ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326)
    AND (
      ("dummyLocation"=:dum AND "gpsPerturbated"=:pert)
      OR ("dummyLocation" = false AND "gpsPerturbated" = false)
    )`,
        {
          minLon: sw[0],
          minLat: sw[1],
          maxLon: ne[0],
          maxLat: ne[1],
          dum: dummyUpdates,
          pert: gpsPerturbated,
        },
      )
      .getRawMany<{ cid: number; locationString: string }>();
  }
}
