import { ApiProperty, ApiPropertyOptional, ApiQuery } from '@nestjs/swagger';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class BackendPrivacyParameters {
  @ApiProperty()
  dummyLocation: boolean;
  @ApiProperty()
  gpsPerturbated: boolean;
  @ApiProperty()
  cloaking: boolean;
  @ApiPropertyOptional()
  perturbatorDecimals?: number;
  @ApiPropertyOptional()
  dummyUpdatesRadiusMin?: number;
  @ApiPropertyOptional()
  dummyUpdatesRadiusStep?: number;
}

export function fromQueryMap(query: any): BackendPrivacyParameters {
  return {
    dummyLocation: /true/i.test(query.dummyLocation),
    cloaking: /true/i.test(query.cloaking),
    dummyUpdatesRadiusMin: Number(query.dummyUpdatesRadiusMin),
    dummyUpdatesRadiusStep: Number(query.dummyUpdatesRadiusStep),
    gpsPerturbated: /true/i.test(query.gpsPerturbated),
    perturbatorDecimals: Number(query.perturbatorDecimals),
  };
}

export const PrivacyOptions = createParamDecorator(
  (_, ctx: ExecutionContext): BackendPrivacyParameters =>
    fromQueryMap(ctx.switchToHttp().getRequest().query),
  [
    (t: any, k: string) => {
      ApiQuery({
        type: [BackendPrivacyParameters],
      })(t, k, Object.getOwnPropertyDescriptor(t, k));
    },
  ],
);
