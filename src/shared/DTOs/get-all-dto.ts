import { SortType } from '../types';

export class GetAllDto {
  q?: string;
  page?: number = 1;
  limit?: number = 10;
  sort?: SortType = 'DESC';
  sortBy?: string = 'createdAt';
  fromDate?: string;
  toDate?: string;
}
