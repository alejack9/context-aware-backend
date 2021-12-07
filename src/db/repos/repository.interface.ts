import { BaseEntity, SelectQueryBuilder, Repository } from 'typeorm';

export interface IRepository<T extends BaseEntity> extends Repository<T> {
  getAverage(coordinates: { lat: number; long: number }): Promise<number>;

  getAllNoisesInArea(
    //    lon      lat
    sw: [number, number], // min
    ne: [number, number], // max
  ): Promise<T[]>;

  countSamplesInArea(
    sw: [number, number], // min
    ne: [number, number], // max
  ): Promise<number>;

  getKMeansInArea(
    //    lon      lat
    sw: [number, number], // min
    ne: [number, number], // max
    k: number,
  ): Promise<{ cid: number; locationString: string }[]>;
}
