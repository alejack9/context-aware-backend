import { BackendGeoJsonProperties } from '../../dtos/backend-geojson-properties';
import { Point, Feature } from 'geojson';
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: 'real_noise' })
export class RealNoise extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public timestamp: Date;

  @Column({
    type: 'geometry',
    srid: 3857,
  })
  public location: Point;

  @Column('double precision')
  public noise: number;

  public static fromFeature(feature: Feature<Point, BackendGeoJsonProperties>) {
    const toRet = new RealNoise();
    toRet.timestamp = new Date(feature.properties.timeStamp);
    toRet.noise = feature.properties.noiseLevel;
    toRet.location = feature.geometry;
    return toRet;
  }
}
