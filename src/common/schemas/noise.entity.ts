import { DomainGeoJsonProperties } from './../dtos/geojson.properties';
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

  static build(feature: Feature<Point, DomainGeoJsonProperties>) {
    const toRet = new Noise();
    toRet.location = feature.geometry;
    toRet.timestamp = new Date(feature.properties.timeStamp);
    toRet.noise = feature.properties.noiseLevel;
    toRet.dummyLocation = feature.properties.dummyLocation;
    toRet.dummyUpdatesCount = feature.properties.dummyUpdatesCount;
    toRet.dummyUpdatesRadiusMax = feature.properties.dummyUpdatesRadiusMax;
    toRet.dummyUpdatesRadiusMin = feature.properties.dummyUpdatesRadiusMin;
    toRet.gpsPerturbated = feature.properties.gpsPerturbated;
    toRet.perturbatorDecimals = feature.properties.perturbatorDecimals;
    return toRet;
  }
}
