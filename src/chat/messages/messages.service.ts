import { Injectable } from '@nestjs/common';
import { MessageEntity } from '../../database/chat/mesage.entity';
import { ILike, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMessageDto, GetAllMessagesDto } from '../DTOs';
import { SessionsService } from '../sessions/sessions.service';
import {
  paginateAndSort,
  sortDeconstruct,
} from '../../shared/helpers/paginator';
import { v7 as uuidv7 } from 'uuid';
import { rangeDateFilter } from '../../shared/helpers/dates';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private readonly sessionService: SessionsService,
  ) {}

  async create(sessionId: string, user: string, body: CreateMessageDto) {
    // validate session
    await this.sessionService.findById(sessionId, user);

    const message = this.messageRepository.create({
      ...body,
      id: uuidv7(), // Generate UUIDv7
      sessionId,
      sender: user,
    });
    return await this.messageRepository.save(message);
  }

  async findAll(sessionId: string, options: GetAllMessagesDto) {
    const where: any = {
      sessionId,
      ...rangeDateFilter(options.fromDate, options.toDate),
    };
    if (options.q) where['message'] = ILike(`%${options.q}%`);

    if (options.afterId) where.id = MoreThan(options.afterId);

    const result = await paginateAndSort(this.messageRepository, {
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
