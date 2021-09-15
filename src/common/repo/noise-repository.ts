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
}
