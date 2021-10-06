import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsModule } from './modules/locations/locations.module';
import { TrustedModule } from './modules/trusted/trusted.module';
import { ConfigModule } from '@nestjs/config';
import { RootController } from './modules/root/root.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LocationsModule,
    TypeOrmModule.forRoot(),
    TrustedModule,
  ],
  controllers: [RootController],
})
export class AppModule {}
