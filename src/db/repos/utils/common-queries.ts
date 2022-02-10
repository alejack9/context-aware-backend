import { BaseEntity, InsertQueryBuilder, InsertResult } from 'typeorm';
import { IRepository } from '../repository.interface';
type tableName = 'real' | 'fake';

export const getAverageQuery = <T extends BaseEntity>(
  tableName: tableName,
  repo: IRepository<T>,
  coordinates: {
    lat: number;
    long: number;
  },
) =>
  repo
    .createQueryBuilder(tableName)
    .select('avg(real.noise) as "avg"')
    .where(
      `ST_DWithin(
      ${tableName}.location,
      ST_Transform(ST_SetSRID(ST_MakePoint(:long, :lat), 4326), 3857),
      3000)`,
      {
        long: coordinates.long,
        lat: coordinates.lat,
      },
    );

export const getKMeansInAreaQuery = (
  repo: IRepository<any>,
  sw: [number, number],
  ne: [number, number],
  k: number,
) =>
  repo
    .createQueryBuilder()
    .select(
      `ST_ClusterKMeans(location, ${k}) OVER() AS cid, ST_AsGeoJSON(ST_Transform(location,4326)) AS "locationString"`,
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

type ValuesAdder = (
  query: InsertQueryBuilder<unknown>,
) => InsertQueryBuilder<unknown>;

export const insertQuery = (
  repo: IRepository<any>,
  valueInsertion: ValuesAdder,
) =>
  valueInsertion(
    repo.createQueryBuilder().insert().into(repo.metadata.tableName),
  );
