import { Injectable, Logger } from '@nestjs/common';
import { FeatureCollection, Point } from 'geojson';
import { RepositoryFactory } from '../../db/repos/factories/repository-factory.service';
import { getManager } from 'typeorm';
import { BackendPrivacyParameters } from 'src/dtos/backend-privacy-parameters';
import { BackendGeoJsonProperties } from 'src/dtos/backend-geojson-properties';

@Injectable()
export class LocationsService {
  private logger = new Logger('LocationsService');

  constructor(private repoFactory: RepositoryFactory) {}

  async getAverageNoise(
    long: number,
    lat: number,
    options: BackendPrivacyParameters,
  ): Promise<number> {
    return await (
      await this.repoFactory.getMetersRepository(options)
    ).getAverage({ lat, long });
  }

  async add(
    featureCollection: FeatureCollection<Point, BackendGeoJsonProperties>,
  ) {
    const realIndex = featureCollection.features.findIndex(
      (feature) =>
        !feature.properties.dummyLocation && !feature.properties.gpsPerturbated,
    );

    const realId = (
      await getManager().query(
        `SELECT
          project.insert_real(
            TO_TIMESTAMP(${featureCollection.features[realIndex].properties.timeStamp}/1000)::TIMESTAMP
            , ${featureCollection.features[realIndex].properties.noiseLevel}
            , ${featureCollection.features[realIndex].geometry.coordinates[1]}
            , ${featureCollection.features[realIndex].geometry.coordinates[0]})
        AS id;`,
      )
    )[0].id;

    const proms = [];
    for (const [i, feature] of featureCollection.features.entries())
      if (i !== realIndex) {
        proms.push(
          getManager().query(
            `SELECT project.insert_fake('project.${this.repoFactory.metersTableNameMaker(
              feature.properties,
            )}', ${realId}, ${feature.geometry.coordinates[1]}, ${
              feature.geometry.coordinates[0]
            });`,
          ),
        );
      }
  }

  async getAllNoisesInArea(
    //            lon     lat
    southWest: [number, number], // min
    northEast: [number, number], // max
    options: BackendPrivacyParameters,
  ): Promise<FeatureCollection<Point>> {
    const res = await (
      await this.repoFactory.getMetersRepository(options)
    ).getAllNoisesInArea(
      southWest, //min
      northEast, //max
    );

    return {
      type: 'FeatureCollection',
      features: res.map((el) => {
        return {
          geometry: el.location,
          properties: {
            timestamp: el.timestamp,
            noise: el.noise,
          },
          type: 'Feature',
        };
      }),
    };
  }

  async countSamplesInArea(
    southWest: [number, number], // min
    northEast: [number, number], // max
    options: BackendPrivacyParameters,
  ) {
    return await (
      await this.repoFactory.getMetersRepository(options)
    ).countSamplesInArea(
      southWest, //min
      northEast, //max
    );
  }

  async getKmeansInArea(
    //           lon      lat
    southWest: [number, number], // min
    northEast: [number, number], // max,
    options: BackendPrivacyParameters,
    k: number,
  ): Promise<FeatureCollection<Point>> {
    const res = await (
      await this.repoFactory.getMetersRepository(options)
    ).getKMeansInArea(
      southWest, //min
      northEast, //max
      k,
    );

    return {
      type: 'FeatureCollection',
      features: res.map((el) => {
        return {
          geometry: JSON.parse(el.locationString),
          properties: {
            cid: el.cid,
          },
          type: 'Feature',
        };
      }),
    };
  }
}
