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

  // get all records
  async getAll(): Promise<Noise[]> {
    return await this.createQueryBuilder().getMany();
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
