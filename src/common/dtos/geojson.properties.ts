import { GeoJsonProperties } from 'geojson';
import * as defaultPrivacyParameters from './../../common/default-privacy-parameters';

export class DomainGeoJsonProperties implements GeoJsonProperties {
  timeStamp: number;
  noiseLevel: number;

  dummyLocation: boolean = defaultPrivacyParameters.dummyUpdatesEnabled;
  gpsPerturbated: boolean = defaultPrivacyParameters.perturbatorEnabled;
  perturbatorDecimals: number = defaultPrivacyParameters.perturbatorDecimals[0];
  dummyUpdatesCount: number = defaultPrivacyParameters.dummyUpdatesCount;
  dummyUpdatesRadiusMin: number =
    defaultPrivacyParameters.dummyUpdatesRadiusMin[0];
  dummyUpdatesRadiusMax: number =
    defaultPrivacyParameters.dummyUpdatesRadiusMax[0];
}
