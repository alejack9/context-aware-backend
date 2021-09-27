import { TrustedService } from './trusted.service';
import { Test } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';

describe('ValueService', () => {
  let trustedService: TrustedService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [TrustedService],
    }).compile();

    trustedService = moduleRef.get<TrustedService>(TrustedService);
  });

  it('#perturbate should return a couple of numbers with the same number of decimal digits of the passed and the first N digits must be the same', () => {
    const toRet = trustedService.perturbate(
      {
        coords: [5.003443342, 5.3443342],
        dummyLocation: false,
        gpsPerturbated: false,
      },
      3,
    );

    const truncate = (num: number, decimals: number) =>
      Math.floor(num * Math.pow(10, decimals)) / Math.pow(10, decimals);

    expect(toRet.coords.map((v) => v.toString().length)).toStrictEqual([11, 9]);

    toRet.coords = toRet.coords.map((v) => truncate(v, 3));

    expect(toRet).toMatchObject({
      coords: [5.003, 5.344],
      dummyLocation: false,
      gpsPerturbated: true,
    });
  });

  it('#dummyPositionMaker should return a ', () => {
    expect(
      trustedService.dummyPositionMaker(
        {
          coords: [13.495330810546875, 43.59630591596548],
          dummyLocation: false,
          gpsPerturbated: false,
        },
        0.0005,
        0.004,
      ),
    ).toBeTruthy();
  });
});
