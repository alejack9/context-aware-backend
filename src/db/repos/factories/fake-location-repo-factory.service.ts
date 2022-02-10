import { IFakeLocation } from '../../schemas/fake-location.interface';
import { RealNoise } from '../../schemas/real-noise.entity';
import { Point } from 'geojson';
import {
  BaseEntity,
  Entity,
  EntityRepository,
  JoinColumn,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  Connection,
} from 'typeorm';
import { DbConnectionService } from '../../db-connection.service';
import { Injectable, Logger } from '@nestjs/common';
import { FakeLocationRepo } from '../fake-location-repo';

@Injectable()
export class FakeLocationRepoFactoryService {
  private logger = new Logger('FakeLocationRepoFactoryService');
  constructor(private connectionService: DbConnectionService) {}

  private repos: Map<string, [FakeLocationRepo<IFakeLocation>, Connection]> =
    new Map();

  async getRepository(
    tableName: string,
  ): Promise<FakeLocationRepo<IFakeLocation>> {
    if (this.repos.size > 80) {
      // this.logger.log('Clearing repos...');
      await this.closeAll();
      // this.logger.log('...Done');
    }
    if (!this.repos.has(tableName)) {
      @Entity({ name: tableName })
      class FakeLocation extends BaseEntity implements IFakeLocation {
        get noise() {
          return this.real.noise;
        }
        get timestamp() {
          return this.real.timestamp;
        }

        @PrimaryGeneratedColumn()
        public id: number;

        @Column({
          type: 'geometry',
          srid: 3857,
        })
        public location: Point;

        @ManyToOne(() => RealNoise)
        @JoinColumn({ name: 'real_id', referencedColumnName: 'id' })
        public real: RealNoise;
      }

      const connection = await this.connectionService.createConnection(
        tableName,
        FakeLocation,
      );

      @EntityRepository(FakeLocation)
      class CustomRepo extends FakeLocationRepo<FakeLocation> {}
      this.repos.set(tableName, [
        connection.getCustomRepository(CustomRepo),
        connection,
      ]);
    }
    return this.repos.get(tableName)[0];
  }

  async closeAll() {
    for (const [_, [__, conn]] of this.repos) await conn.close();
    this.repos.clear();
  }
}
