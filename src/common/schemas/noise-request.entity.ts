import { RequestPosition } from './../dtos/request.dto';
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
  location: Point;

  @Column()
  dummyLocation: boolean;

  @Column()
  gpsPerturbated: boolean;

  static build(req: RequestPosition) {
    const toRet = new NoiseRequest();
    toRet.dummyLocation = req.dummyLocation;
    toRet.gpsPerturbated = req.gpsPerturbated;
    toRet.location = {
      type: 'Point',
      coordinates: req.coords,
    };
    toRet.timestamp = new Date(Date.now());
    return toRet;
  }
}
