import { Repository, EntityRepository } from 'typeorm';
import { CloakingNoise } from '../schemas/cloaking.entity';

@EntityRepository(CloakingNoise)
export class CloakingRepository extends Repository<CloakingNoise> {
  async getAverage(coordinates: {
    lat: number;
    long: number;
  }): Promise<number> {
    return (
      await this.createQueryBuilder()
        .select('avg(noise) as "avg"')
        .where(
          `ST_Transform(ST_SetSRID(ST_MakePoint(:long, :lat), 4326), 3857) & rectangle`,
          {
            long: coordinates.long,
            lat: coordinates.lat,
          },
        )
        .getRawOne()
    ).avg;
  }
}
