module.exports = {
  type: 'postgres',
  host: process.env.TYPEORM_HOST || 'localhost',
  port: process.env.TYPEORM_PORT || 5432,
  username: process.env.TYPEORM_USERNAME || 'postgres',
  password: process.env.TYPEORM_PASSWORD || 'pass',
  database: process.env.TYPEORM_DATABASE || 'postgres',
  schema: 'project',
  synchronize: true,
  entities: ['dist/**/*.entity{.ts,.js}'],
  logging: false,
  migrations: ['src/migration/**/*{.ts, .js}'],
  subscribers: ['src/subscriber/**/*{.ts, .js}'],
};
