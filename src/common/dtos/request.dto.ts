export interface RequestDto {
  positions: PositionRequest[];
  settings: PrivacyPreferences;
}

export function buildDto(
  positions: PositionRequest[],
  dummyUpdatesCount: number,
  dummyUpdatesRadiusMax: number,
  dummyUpdatesRadiusMin: number,
  perturbatorDecimals: number,
): RequestDto {
  return {
    positions,
    settings: {
      dummyUpdatesCount,
      dummyUpdatesRadiusMax,
      dummyUpdatesRadiusMin,
      perturbatorDecimals,
    },
  };
}

export interface PositionRequest {
  dummyLocation: boolean;
  gpsPerturbated: boolean;
  coords: number[];
}

export interface PrivacyPreferences {
  perturbatorDecimals: number;
  dummyUpdatesCount: number;
  dummyUpdatesRadiusMin: number;
  dummyUpdatesRadiusMax: number;
}
