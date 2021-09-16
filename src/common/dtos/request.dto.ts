export interface RequestDto {
  positions: RequestPosition[];
}

export interface RequestPosition {
  dummyLocation: boolean;
  gpsPerturbated: boolean;
  coords: number[];
}
