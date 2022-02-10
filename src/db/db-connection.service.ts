import { DatabaseConfig } from './../config/orm.config.interface';
import { RealNoise } from './schemas/real-noise.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConnectionOptions, createConnection } from 'typeorm';

@Injectable()
export class DbConnectionService {
  constructor(private configService: ConfigService) {}

  async createConnection(tableName?: string, entityType?: object) {
    const name = tableName ? `table:${tableName}` : 'default';

    const entities: any = [RealNoise];
    if (entityType) entities.push(entityType);

    const newOptions = {
      ...this.configService.get<DatabaseConfig>('database'),
      synchronize: false,
      name,
      entities,
    };
    return await createConnection(newOptions as ConnectionOptions);
  }
}
