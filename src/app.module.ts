import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { CatalogController } from './catalog/catalog.controller';
import { CatalogService } from './catalog/catalog.service';

@Module({
  imports: [],
  controllers: [HealthController, CatalogController],
  providers: [CatalogService],
})
export class AppModule {}
