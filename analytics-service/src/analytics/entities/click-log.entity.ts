import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SearchLog } from './search-log.entity';

@Entity('click_logs')
export class ClickLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  search_log_id: number;

  @Column({ type: 'int' })
  page_id: number;

  @CreateDateColumn()
  clicked_at: Date;

  @ManyToOne(() => SearchLog, (searchLog) => searchLog.clickLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'search_log_id' })
  searchLog: SearchLog;
}
