import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @ApiProperty({ example: 'New Rag Chat', description: 'Title of the chat' })
  title: string;

  @ApiProperty({ example: false, description: 'Is the chat a favorite', required: false })
  @IsOptional()
  @IsBoolean()
  isFavorite: boolean = false;
}