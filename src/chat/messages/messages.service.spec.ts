import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MessagesService } from './messages.service';
import { MessageEntity } from '../../database/chat/mesage.entity';
import { SessionsService } from '../sessions/sessions.service';
import { CreateMessageDto, GetAllMessagesDto } from '../DTOs';

// Mock helpers & uuid
jest.mock('../../shared/helpers/paginator', () => ({
  paginateAndSort: jest.fn(),
  sortDeconstruct: jest.fn(),
}));
jest.mock('../../shared/helpers/dates', () => ({
  rangeDateFilter: jest.fn(),
}));
jest.mock('uuid', () => ({
  v7: jest.fn(),
}));

import {
  paginateAndSort,
  sortDeconstruct,
} from '../../shared/helpers/paginator';
import { rangeDateFilter } from '../../shared/helpers/dates';
import { v7 as uuidv7 } from 'uuid';
import { createRepoMock, resetHelperMocks } from '../../../test/helpers/test-utils';

describe('MessagesService', () => {
  let service: MessagesService;
  let repo: jest.Mocked<Repository<MessageEntity>>;
  let sessionsService: jest.Mocked<SessionsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getRepositoryToken(MessageEntity),
          useValue: createRepoMock<MessageEntity>(),
        },
        { provide: SessionsService, useValue: { findById: jest.fn() } },
      ],
    }).compile();

    service = moduleRef.get(MessagesService);
    repo = moduleRef.get(getRepositoryToken(MessageEntity));
    sessionsService = moduleRef.get(SessionsService) as any;

    resetHelperMocks([
      paginateAndSort,
      sortDeconstruct,
      rangeDateFilter,
      uuidv7,
    ]);
  });

  // create
  it('create: validates session, generates uuidv7, saves', async () => {
    const sessionId = 'session-uuid';
    const user = 'user-123';
    const body: CreateMessageDto = { message: 'hello', role: 'user' } as any;

    (uuidv7 as jest.Mock).mockReturnValue('new-uuid-v7');
    const created = { id: 'new-uuid-v7', sessionId, sender: user, ...body };
    repo.create.mockReturnValue(created as any);
    repo.save.mockResolvedValue({ ...created, createdAt: new Date() } as any);

    const result = await service.create(sessionId, user, body);

    expect(sessionsService.findById).toHaveBeenCalledWith(sessionId, user);
    expect(repo.create).toHaveBeenCalledWith({
      ...body,
      id: 'new-uuid-v7',
      sessionId,
      sender: user,
    });
    expect(repo.save).toHaveBeenCalledWith(created);
    expect(result).toMatchObject({
      id: 'new-uuid-v7',
      sessionId,
      sender: user,
      message: 'hello',
    });
  });

  // findAll
  it('findAll: sessionId + q + date range + default pagination', async () => {
    const sessionId = 'S1';
    const options: GetAllMessagesDto = {
      q: 'hi',
      fromDate: '2025-01-01' as any,
      toDate: '2025-12-31' as any,
    } as any;

    (rangeDateFilter as jest.Mock).mockReturnValue({
      createdAt: { $gte: 'FROM', $lte: 'TO' },
    });
    (paginateAndSort as jest.Mock).mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 10 },
    });

    await service.findAll(sessionId, options);

    expect(rangeDateFilter).toHaveBeenCalledWith(
      options.fromDate,
      options.toDate,
    );
    const args = (paginateAndSort as jest.Mock).mock.calls[0][1];
    expect(args.page).toBe(1);
    expect(args.limit).toBe(10);
    expect(args.query.sessionId).toBe('S1');
    expect(args.query.createdAt).toEqual({ $gte: 'FROM', $lte: 'TO' });
    expect(args.query.message).toBeDefined(); // ILike
  });

  it('findAll: respects page/limit and afterId (+ MoreThan)', async () => {
    const sessionId = 'S2';
    const options: GetAllMessagesDto = {
      page: 3,
      limit: 5,
      afterId: 'last-id',
    } as any;

    (rangeDateFilter as jest.Mock).mockReturnValue({});
    (paginateAndSort as jest.Mock).mockResolvedValue({
      data: [],
      meta: { page: 3, limit: 5 },
    });

    await service.findAll(sessionId, options);

    const { query, page, limit } = (paginateAndSort as jest.Mock).mock
      .calls[0][1];
    expect(page).toBe(3);
    expect(limit).toBe(5);
    expect(query.sessionId).toBe('S2');
    expect(query.id).toBeDefined(); // MoreThan
  });

  it('findAll: includes sort when provided', async () => {
    (rangeDateFilter as jest.Mock).mockReturnValue({});
    (sortDeconstruct as jest.Mock).mockReturnValue({ createdAt: 'DESC' });
    (paginateAndSort as jest.Mock).mockResolvedValue({ data: [], meta: {} });

    const sessionId = 'S3';
    const options: GetAllMessagesDto = {
      sortBy: 'createdAt',
      sort: 'desc',
    } as any;
    await service.findAll(sessionId, options);

    expect(sortDeconstruct).toHaveBeenCalledWith('createdAt', 'desc');
    const args = (paginateAndSort as jest.Mock).mock.calls[0][1];
    expect(args.order).toEqual({ createdAt: 'DESC' });
  });
});
