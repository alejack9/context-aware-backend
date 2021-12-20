import { Polygon } from 'geojson';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'cloaking_noise' })
export class CloakingNoise extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public timestamp: Date;

  @Column({
    type: 'geometry',
    srid: 3857,
  })
  public rectangle: Polygon;

  @Column('double precision')
  public noise: number;
}
