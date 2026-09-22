import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateSearchLogDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsOptional()
  @IsUUID()
  user_id?: string;
}
