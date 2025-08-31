import { Expose } from 'class-transformer';
import { SessionResponseDto } from '../sessions';
import { ApiResponseProperty } from '@nestjs/swagger';

@Expose()
export class MessageResponseDto {
  @Expose()
  @ApiResponseProperty()
  id: string;

  @Expose()
  @ApiResponseProperty()
  message: string;

  @Expose()
  @ApiResponseProperty()
  session: SessionResponseDto;

  @Expose()
  @ApiResponseProperty()
  sender: string;

  @Expose()
  @ApiResponseProperty()
  createdAt: Date;
}
