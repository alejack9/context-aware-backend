import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsModule } from './modules/locations/locations.module';
import { TrustedModule } from './modules/trusted/trusted.module';

@Module({
  imports: [LocationsModule, TypeOrmModule.forRoot(), TrustedModule],
})
export class AppModule {}
