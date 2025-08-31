import { GetAllDto } from '../../../shared/DTOs';

export class GetAllMessagesDto extends GetAllDto {
  afterId?: string;
}
