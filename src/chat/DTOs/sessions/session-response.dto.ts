import { Expose } from 'class-transformer';
import { ApiResponseProperty } from '@nestjs/swagger';

@Expose()
export class SessionResponseDto {
  @Expose()
  @ApiResponseProperty()
  id: string;

  @Expose()
  @ApiResponseProperty()
  title: string;

  @Expose()
  @ApiResponseProperty()
  user: string;

  @Expose()
  @ApiResponseProperty()
  isFavorite: boolean;

  @Expose()
  @ApiResponseProperty()
  createdAt: Date;

  @Expose()
  @ApiResponseProperty()
  updatedAt: Date;
}