import { FakeLocationRepoFactoryService } from './fake-location-repo-factory.service';
import { RealLocationRepository } from '../real-location-repo';
import { getCustomRepository } from 'typeorm';
import { RealNoise } from './../../schemas/real-noise.entity';
import { IRepository } from '../repository.interface';
import { Injectable, Logger } from '@nestjs/common';
import removedComma from '../../../utils/comma-remover';
import { IFakeLocation } from '../../schemas/fake-location.interface';
import { DbConnectionService } from '../../db-connection.service';
import { BackendPrivacyParameters } from 'src/dtos/backend-privacy-parameters';
import { CloakingRepository } from '../cloaking-repo';

@Injectable()
export class RepositoryFactory {
  private logger = new Logger('RepositoryFactory');

  constructor(
    private fakeLocationRepo: FakeLocationRepoFactoryService,
    private connectionService: DbConnectionService,
  ) {
    this.connectionService.createConnection();
  }

  metersTableNameMaker(options: BackendPrivacyParameters) {
    let tablePrefix: string;
    let configs = [];
    if (options.dummyLocation) {
      configs.push(
        removedComma(options.dummyUpdatesRadiusMin),
        removedComma(options.dummyUpdatesRadiusStep),
      );
      if (options.gpsPerturbated) {
        // both
        tablePrefix = 'dummy_pert';
        configs.push(options.perturbatorDecimals);
      } else {
        // dummy only
        tablePrefix = 'dummy';
      }
    } else {
      if (options.gpsPerturbated) {
        // pert only
        tablePrefix = 'perturbated';
        configs.push(options.perturbatorDecimals);
      } else {
        // none
        tablePrefix = 'real';
      }
    }

    return tablePrefix + configs.join('_') + '_noise';
  }

  async getRepository(
    options: BackendPrivacyParameters,
  ): Promise<IRepository<IFakeLocation | RealNoise>> {
    return !options.dummyLocation && !options.gpsPerturbated
      ? getCustomRepository(RealLocationRepository)
      : await this.fakeLocationRepo.getRepository(
          this.metersTableNameMaker(options),
        );
  }

  get realRepository() {
    return getCustomRepository(RealLocationRepository);
  }

  get cloakingRepo() {
    return getCustomRepository(CloakingRepository);
  }
}
