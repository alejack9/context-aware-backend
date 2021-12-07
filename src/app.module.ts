import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './routes/root/app.controller';
import { LocationsModule } from './routes/locations/locations.module';
import { DbModule } from './db/db.module';
import ormconfig from './config/orm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [ormconfig],
    }),
    LocationsModule,
    DbModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
