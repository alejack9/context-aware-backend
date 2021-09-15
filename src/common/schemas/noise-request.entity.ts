import { Point } from 'geojson';
import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class NoiseRequest extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  timestamp: Date;

  @Column({
    type: 'geometry',
  })
  correctLocation: Point;

  static build(
    timeStamp: number,
    correctLocation: Point,
    otherLocations: Point[],
  ) {
    const toRet = new NoiseRequest();
    toRet.correctLocation = correctLocation;
    toRet.timestamp = new Date(timeStamp);
    return toRet;
  }
}
