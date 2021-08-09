import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsModule } from './modules/locations/locations.module';

@Module({
  imports: [LocationsModule, TypeOrmModule.forRoot()],
})
export class AppModule {}
