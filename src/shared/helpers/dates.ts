import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

export const rangeDateFilter = (startDate?: string, endDate?: string) => {
  const where: any = {};
  // check if startDate and endDate are valid dates
  if (startDate && isNaN(Date.parse(startDate))) {
    throw new BadRequestException('Invalid start date');
  }
  if (endDate && isNaN(Date.parse(endDate))) {
    throw new BadRequestException('Invalid end date');
  }
  let start: Date;
  if (startDate) {
    where.createdAt = where.createdAt || {};
    start = new Date(startDate);

    start.setUTCHours(0, 0, 0, 0);
    where.createdAt = MoreThanOrEqual(start);
  }
  if (endDate) {
    where.createdAt = where.createdAt || {};
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);
    // @ts-ignore
    if (start && end < start) {
      throw new BadRequestException(
        'End date must be greater than or equal to start date',
      );
    }
    // @ts-ignore
    where.createdAt = start ? Between(start, end) : LessThanOrEqual(end);
  }

  return where;
};
