import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { SearchLog } from './entities/search-log.entity';
import { ClickLog } from './entities/click-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SearchLog, ClickLog])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
