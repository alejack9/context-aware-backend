import { BaseEntity } from 'typeorm';
import { RealNoise } from './real-noise.entity';
import { Point } from 'geojson';

export interface IFakeLocation extends BaseEntity {
  id: number;
  location: Point;
  real: RealNoise;
  noise: number;
  timestamp: Date;
}
