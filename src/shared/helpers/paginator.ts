import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

export interface PaginatedResponse<T> {
  items: T[];
  limit: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationOptions<T> {
  page: number;
  limit: number;
  selectedFields?: FindOptionsSelect<T>;
  query?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
  order?: FindOptionsOrder<T>;
  relations?: FindOptionsRelations<T>;
}

export async function paginateAndSort<T>(
// @ts-ignore
  repository: Repository<T>,
  options: PaginationOptions<T>,
): Promise<PaginatedResponse<T>> {
  const { page, limit, order, query, selectedFields, relations } = options;

  const [data, count] = await repository.findAndCount({
    where: query,
    relations: relations,
    select: selectedFields,
    skip: (page - 1) * limit,
    take: limit,
    order: order,
  });

  const paginatorData = getPaginatorFields(count, page, limit);
  return { ...paginatorData, items: data };
}

export interface PaginatorFields {
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
  currentPage: number;
}

export function getPaginatorFields(
  count: number,
  page: number,
  limit: number,
): PaginatorFields {
  const totalPages = Math.ceil(count / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    totalPages,
    limit,
    hasNextPage,
    hasPreviousPage,
    totalItems: count,
    currentPage: page,
  };
}

export function sortDeconstruct(sortBy: string, sort: string) {
  if (sortBy && sort) {
    const sortByDeconstructed = sortBy.split('.');
    const order = sortByDeconstructed.reduceRight((obj, key) => ({ [key]: obj }), sort.toUpperCase() as any);
    return order;
  }
  return {};
}
