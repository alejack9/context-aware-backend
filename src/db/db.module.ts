import { RepositoryFactory } from './repos/factories/repository-factory.service';
import { FakeLocationRepoFactoryService } from './repos/factories/fake-location-repo-factory.service';
import { DbConnectionService } from './db-connection.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    DbConnectionService,
    FakeLocationRepoFactoryService,
    RepositoryFactory,
  ],
  exports: [RepositoryFactory],
})
export class DbModule {}
