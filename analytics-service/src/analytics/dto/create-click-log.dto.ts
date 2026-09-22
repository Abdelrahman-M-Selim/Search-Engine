import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateClickLogDto {
  @IsInt()
  @IsNotEmpty()
  search_log_id: number;

  @IsInt()
  @IsNotEmpty()
  page_id: number;
}
