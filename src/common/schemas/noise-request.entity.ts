import { PositionRequest, PrivacyPreferences } from './../dtos/request.dto';
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

  @Column()
  perturbatorDecimals: number;

  @Column()
  dummyUpdatesCount: number;

  @Column('double precision')
  dummyUpdatesRadiusMin: number;

  @Column('double precision')
  dummyUpdatesRadiusMax: number;

  static build(req: PositionRequest, privacyPreferences: PrivacyPreferences) {
    const toRet = new NoiseRequest();
    toRet.dummyLocation = req.dummyLocation;
    toRet.gpsPerturbated = req.gpsPerturbated;
    toRet.location = {
      type: 'Point',
      coordinates: req.coords,
    };
    toRet.timestamp = new Date(Date.now());
    toRet.dummyUpdatesRadiusMin = privacyPreferences.dummyUpdatesRadiusMin;
    toRet.dummyUpdatesRadiusMax = privacyPreferences.dummyUpdatesRadiusMax;
    toRet.dummyUpdatesCount = privacyPreferences.dummyUpdatesCount;
    toRet.perturbatorDecimals = privacyPreferences.perturbatorDecimals;

    return toRet;
  }
}
