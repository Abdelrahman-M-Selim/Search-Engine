import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CreateSearchLogDto } from './dto/create-search-log.dto';
import { CreateClickLogDto } from './dto/create-click-log.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('search')
  @HttpCode(HttpStatus.CREATED)
  async logSearch(@Body() dto: CreateSearchLogDto) {
    return this.analyticsService.logSearch(dto);
  }

  @Post('click')
  @HttpCode(HttpStatus.CREATED)
  async logClick(@Body() dto: CreateClickLogDto) {
    return this.analyticsService.logClick(dto);
  }

  @Get('top-queries')
  async getTopQueries() {
    return this.analyticsService.getTopQueries();
  }

  @Get('click-through-rate')
  async getCtr(@Query('window') window?: string) {
    return this.analyticsService.getClickThroughRate(window);
  }
}
