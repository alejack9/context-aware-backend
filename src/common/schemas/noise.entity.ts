import { Feature, Point } from 'geojson';
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

  static build(feature: Feature<Point>) {
    const toRet = new Noise();
    toRet.location = feature.geometry;
    toRet.timestamp = new Date(feature.properties.timeStamp);
    toRet.noise = feature.properties.noiseLevel;
    return toRet;
  }
}
