import { Feature, Point, GeoJsonProperties } from 'geojson';
import { BackendPrivacyParameters } from './backend-privacy-parameters';

export class BackendGeoJsonProperties
  extends BackendPrivacyParameters
  implements GeoJsonProperties
{
  timeStamp: number;
  noiseLevel: number;
}

export function createFeature(
  coordinates: number[],
  noiseLevel: number,
  timeStamp: number,
  params: BackendPrivacyParameters,
): Feature<Point, BackendGeoJsonProperties> {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates,
    },
    properties: {
      dummyLocation: params.dummyLocation,
      gpsPerturbated: params.gpsPerturbated,
      noiseLevel: noiseLevel,
      timeStamp: timeStamp,
      dummyUpdatesRadiusMin: params.dummyUpdatesRadiusMin,
      dummyUpdatesRadiusStep: params.dummyUpdatesRadiusStep,
      perturbatorDecimals: params.perturbatorDecimals,
    },
  };
}
