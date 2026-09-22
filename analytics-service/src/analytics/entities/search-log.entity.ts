import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { ClickLog } from './click-log.entity';

@Entity('search_logs')
export class SearchLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  query: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @CreateDateColumn()
  searched_at: Date;

  @OneToMany(() => ClickLog, (clickLog) => clickLog.searchLog)
  clickLogs: ClickLog[];
}
