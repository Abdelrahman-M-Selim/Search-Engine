import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { AnalyticsModule } from './analytics/analytics.module';
import { SearchLog } from './analytics/entities/search-log.entity';
import { ClickLog } from './analytics/entities/click-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database.url') || 'postgresql://user:password@postgres:5432/search_engine',
        entities: [SearchLog, ClickLog],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AnalyticsModule,
  ],
})
export class AppModule {}
