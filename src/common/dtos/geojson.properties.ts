import { GeoJsonProperties } from 'geojson';
import * as defaultPrivacyParameters from './../../common/default-privacy-parameters';

export class DomainGeoJsonProperties implements GeoJsonProperties {
  timeStamp: number;
  noiseLevel: number;

  dummyLocation: boolean = defaultPrivacyParameters.dummyUpdatesEnabled;
  gpsPerturbated: boolean = defaultPrivacyParameters.perturbatorEnabled;
  perturbatorDecimals: number = defaultPrivacyParameters.perturbatorDecimals;
  dummyUpdatesCount: number = defaultPrivacyParameters.dummyUpdatesCount;
  dummyUpdatesRadiusMin: number =
    defaultPrivacyParameters.dummyUpdatesRadiusMin;
  dummyUpdatesRadiusMax: number =
    defaultPrivacyParameters.dummyUpdatesRadiusMax;
}
