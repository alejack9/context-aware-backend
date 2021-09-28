import { GeoJsonProperties } from 'geojson';

export interface DomainGeoJsonProperties extends GeoJsonProperties {
  timeStamp: number;
  noiseLevel: number;

  dummyLocation: boolean;
  gpsPerturbated: boolean;
  perturbatorDecimals: number;
  dummyUpdatesCount: number;
  dummyUpdatesRadiusMin: number;
  dummyUpdatesRadiusMax: number;
}
