export interface RequestDto {
  positions: PositionRequest[];
  settings: PrivacyPreferences;
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
