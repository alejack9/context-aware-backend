import { Injectable, Logger } from '@nestjs/common';
import { FeatureCollection, Point, Polygon } from 'geojson';
import { RepositoryFactory } from '../../db/repos/factories/repository-factory.service';
import { getManager } from 'typeorm';
import { BackendPrivacyParameters } from 'src/dtos/backend-privacy-parameters';
import { BackendGeoJsonProperties } from 'src/dtos/backend-geojson-properties';
import { writeFileSync } from 'fs';

@Injectable()
export class LocationsService {
  private logger = new Logger('LocationsService');

  constructor(private repoFactory: RepositoryFactory) {}

  async getAverageNoise(
    long: number,
    lat: number,
    options: BackendPrivacyParameters,
  ): Promise<number> {
    const avgs = [
      await (
        await this.repoFactory.getRepository(options)
      ).getAverage({ lat, long }),
    ];
    if (options.cloaking)
      avgs.push(await this.repoFactory.cloakingRepo.getAverage({ lat, long }));
    return avgs.reduce((a, b) => a + b) / avgs.length;
  }

  saveAsFile(
    featureCollection: FeatureCollection<
      Point | Polygon,
      BackendGeoJsonProperties
    >,
  ) {
    const name = new Date().getTime().toString();
    this.logger.log(
      `Feature Collection features count: ${featureCollection.features.length}`,
    );
    this.logger.log(`Saving to ${name}.json`);
    writeFileSync(
      `${name}.json`,
      JSON.stringify(featureCollection, null, '\t'),
    );
    this.logger.log('Done');
  }

  async savePoints(
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

    await Promise.all(
      featureCollection.features
        .filter((_, i) => i !== realIndex)
        .map((feature) =>
          getManager().query(
            `SELECT project.insert_fake('project.${this.repoFactory.metersTableNameMaker(
              feature.properties,
            )}', ${realId}, ${feature.geometry.coordinates[1]}, ${
              feature.geometry.coordinates[0]
            });`,
          ),
        ),
    );
  }

  async saveRects(
    featureCollection: FeatureCollection<Polygon, BackendGeoJsonProperties>,
  ) {
    await Promise.all(
      featureCollection.features.map((feature) =>
        getManager().query(
          `SELECT project.insert_rect(
            TO_TIMESTAMP(${feature.properties.timeStamp}/1000)::TIMESTAMP
            , ${feature.properties.noiseLevel}
            , '${JSON.stringify(feature.geometry)}'::text
          )`,
        ),
      ),
    );
  }

  async add(
    featureCollection: FeatureCollection<
      Point | Polygon,
      BackendGeoJsonProperties
    >,
  ) {
    if (featureCollection.features.length === 0) return;

    // return this.saveAsFile(featureCollection);

    if (featureCollection.features[0].geometry.type === 'Polygon')
      await this.saveRects(
        featureCollection as FeatureCollection<
          Polygon,
          BackendGeoJsonProperties
        >,
      );
    else if (featureCollection.features[0].geometry.type === 'Point')
      await this.savePoints(
        featureCollection as FeatureCollection<Point, BackendGeoJsonProperties>,
      );
  }

  async getAllNoisesInArea(
    //            lon     lat
    southWest: [number, number], // min
    northEast: [number, number], // max
    options: BackendPrivacyParameters,
  ): Promise<FeatureCollection<Point>> {
    return {
      type: 'FeatureCollection',
      features: (
        await (
          await this.repoFactory.getRepository(options)
        ).getAllNoisesInArea(
          southWest, //min
          northEast, //max
        )
      ).map((el) => {
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
      await this.repoFactory.getRepository(options)
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
    return {
      type: 'FeatureCollection',
      features: (
        await (
          await this.repoFactory.getRepository(options)
        ).getKMeansInArea(
          southWest, //min
          northEast, //max
          k,
        )
      ).map((el) => {
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
