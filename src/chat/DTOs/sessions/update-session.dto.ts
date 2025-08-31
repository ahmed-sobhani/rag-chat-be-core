import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSessionDto {
  @IsString()
  @IsOptional()
  @Length(1, 255)
  @ApiProperty({
    example: 'Update Rag Chat',
    description: 'Title of the chat',
  })
  title?: string;

  @ApiProperty({ description: 'Is the chat a favorite', required: false })
  @IsOptional()
  @IsBoolean()
  isFavorite: boolean;
}
