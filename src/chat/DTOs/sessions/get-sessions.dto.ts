import { GetAllDto } from '../../../shared/DTOs';

export class GetAllSessionsDto extends GetAllDto {
  user: string;
  isFavorite?: boolean;
}
