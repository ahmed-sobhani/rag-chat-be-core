import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionEntity } from '../../database/chat/session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateSessionDto, GetAllSessionsDto, UpdateSessionDto } from '../DTOs';
import {
  paginateAndSort,
  sortDeconstruct,
} from '../../shared/helpers/paginator';
import { rangeDateFilter } from '../../shared/helpers/dates';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
  ) {}

  async create(
    session: CreateSessionDto,
    user: string,
  ): Promise<SessionEntity> {
    const newSession = this.sessionRepository.create({ ...session, user });
    return this.sessionRepository.save(newSession);
  }

  async patch(
    id: string,
    info: UpdateSessionDto,
    user: string,
  ): Promise<SessionEntity> {
    const session = await this.findById(id, user);

    session.title = info.title ?? session.title;
    session.isFavorite =
      info.isFavorite !== undefined ? info.isFavorite : session.isFavorite;

    return this.sessionRepository.save(session);
  }

  async toggleFavorite(id: string, user: string): Promise<void> {
    const session = await this.findById(id, user);

    session.isFavorite = !session.isFavorite;

    await this.sessionRepository.save(session);
  }

  async delete(id: string, user: string): Promise<void> {
    const session = await this.findById(id, user);

    session.deletedAt = new Date();
    session.deletedBy = user;

    await this.sessionRepository.save(session);
  }

  async findById(
    id: string,
    user: string | null = null,
    throwError = true,
  ): Promise<SessionEntity> {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session) {
      if (throwError) throw new NotFoundException('No such chat');
      else {
        // @ts-ignore
        return null;
      }
    }
    if (user && session?.user !== user) {
      throw new ForbiddenException('You do not have access to this chat');
    }

    return session;
  }

  async findAll(options: GetAllSessionsDto) {
    const where: any = {
      user: options.user,
      ...rangeDateFilter(options.fromDate, options.toDate),
    };

    if (options.isFavorite !== undefined) {
      where.isFavorite = options.isFavorite;
    }

    if (options.q) where.title = ILike(`%${options.q}%`);

    const result = await paginateAndSort(this.sessionRepository, {
      page: options.page || 1,
      limit: options.limit || 10,
      query: where,
      order:
        options.sortBy && options.sort
          ? sortDeconstruct(options.sortBy, options.sort)
          : undefined,
    });
    return result;
  }
}
