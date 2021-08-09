import { Point } from 'geojson';
import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Noise extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  timestamp: Date;

  @Column({
    type: 'geometry',
  })
  location: Point;

  @Column('double precision')
  noise: number;

  static build(location: Point, timestamp: number, noise: number) {
    const toRet = new Noise();
    toRet.location = location;
    toRet.timestamp = new Date(timestamp);
    toRet.noise = noise;
    return toRet;
  }
}
