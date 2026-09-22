import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchLog } from './entities/search-log.entity';
import { ClickLog } from './entities/click-log.entity';
import { CreateSearchLogDto } from './dto/create-search-log.dto';
import { CreateClickLogDto } from './dto/create-click-log.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(SearchLog)
    private readonly searchLogRepo: Repository<SearchLog>,
    @InjectRepository(ClickLog)
    private readonly clickLogRepo: Repository<ClickLog>,
  ) {}

  async logSearch(dto: CreateSearchLogDto): Promise<SearchLog> {
    const log = this.searchLogRepo.create(dto);
    return this.searchLogRepo.save(log);
  }

  async logClick(dto: CreateClickLogDto): Promise<ClickLog> {
    const log = this.clickLogRepo.create(dto);
    return this.clickLogRepo.save(log);
  }

  async getTopQueries(): Promise<any[]> {
    return this.searchLogRepo
      .createQueryBuilder('log')
      .select('log.query', 'query')
      .addSelect('COUNT(log.id)', 'count')
      .groupBy('log.query')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();
  }

  async getClickThroughRate(window: string = '7d'): Promise<{ ctr: number; window: string }> {
    let days = 7;
    const match = window.match(/^(\d+)d$/);
    if (match) {
      days = parseInt(match[1], 10);
    }

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - days);

    const searches = await this.searchLogRepo
      .createQueryBuilder('log')
      .where('log.searched_at >= :threshold', { threshold: thresholdDate })
      .getCount();

    const clicks = await this.clickLogRepo
      .createQueryBuilder('log')
      .where('log.clicked_at >= :threshold', { threshold: thresholdDate })
      .getCount();

    const ctr = searches > 0 ? clicks / searches : 0;
    
    return { ctr: Number(ctr.toFixed(4)), window };
  }
}
