import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

export class SuccessResponse<T> {
  @ApiResponseProperty({ example: true })
  success: boolean;

  @ApiResponseProperty()
  data: T;

  @ApiResponseProperty({ example: 'Operation succeeded' })
  message: string;
}
