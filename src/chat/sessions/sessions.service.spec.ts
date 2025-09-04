import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { SessionsService } from './sessions.service';
import { SessionEntity } from '../../database/chat/session.entity';
import { CreateSessionDto, GetAllSessionsDto, UpdateSessionDto } from '../DTOs';

// Mock helpers
jest.mock('../../shared/helpers/paginator', () => ({
  paginateAndSort: jest.fn(),
  sortDeconstruct: jest.fn(),
}));
jest.mock('../../shared/helpers/dates', () => ({
  rangeDateFilter: jest.fn(),
}));

import {
  paginateAndSort,
  sortDeconstruct,
} from '../../shared/helpers/paginator';
import { rangeDateFilter } from '../../shared/helpers/dates';
import {
  createRepoMock,
  resetHelperMocks,
} from '../../../test/helpers/test-utils';

const VALID_UUID = '6a9c5a1c-8b6c-4e8d-9c5f-5b3e5d2c1a00';

describe('SessionsService', () => {
  let service: SessionsService;
  let repo: jest.Mocked<Repository<SessionEntity>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: getRepositoryToken(SessionEntity),
          useValue: createRepoMock<SessionEntity>(),
        },
      ],
    }).compile();

    service = moduleRef.get(SessionsService);
    repo = moduleRef.get(getRepositoryToken(SessionEntity));
    resetHelperMocks([paginateAndSort, sortDeconstruct, rangeDateFilter]);
  });

  // create
  it('create: merges user, saves, returns entity', async () => {
    const dto: CreateSessionDto = { title: 'Chat A', isFavorite: false } as any;
    const user = 'user-123';

    const created: Partial<SessionEntity> = {
      id: VALID_UUID,
      title: 'Chat A',
      isFavorite: false,
      user,
    };
    repo.create.mockReturnValue(created as any);
    repo.save.mockResolvedValue(created as any);

    const result = await service.create(dto, user);

    expect(repo.create).toHaveBeenCalledWith({ ...dto, user });
    expect(repo.save).toHaveBeenCalledWith(created);
    expect(result).toEqual(created);
  });

  // patch
  it('patch: updates provided fields only', async () => {
    const existing: SessionEntity = {
      id: VALID_UUID,
      title: 'Old',
      user: 'u1',
      isFavorite: false,
    } as any;
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation(async (s: any) => s);

    const info: UpdateSessionDto = { title: 'New Title' } as any;
    const out = await service.patch(VALID_UUID, info, 'u1');

    expect(out.title).toBe('New Title');
    expect(out.isFavorite).toBe(false);
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: VALID_UUID, title: 'New Title' }),
    );
  });

  it('patch: respects isFavorite=false', async () => {
    const existing: SessionEntity = {
      id: VALID_UUID,
      title: 'Old',
      user: 'u1',
      isFavorite: true,
    } as any;
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation(async (s: any) => s);

    const info: UpdateSessionDto = { isFavorite: false } as any;
    const out = await service.patch(VALID_UUID, info, 'u1');

    expect(out.isFavorite).toBe(false);
  });

  // toggleFavorite
  it('toggleFavorite: flips boolean and saves', async () => {
    const existing: SessionEntity = {
      id: VALID_UUID,
      user: 'u1',
      title: 'X',
      isFavorite: false,
    } as any;
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation(async (s: any) => s);

    await service.toggleFavorite(VALID_UUID, 'u1');
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: VALID_UUID, isFavorite: true }),
    );
  });

  // delete (soft)
  it('delete: sets deletedAt/deletedBy', async () => {
    const existing: SessionEntity = {
      id: VALID_UUID,
      user: 'u1',
      title: 'X',
      isFavorite: false,
      deletedAt: null,
      deletedBy: null,
    } as any;
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation(async (s: any) => s);

    const before = Date.now();
    await service.delete(VALID_UUID, 'u1');
    const saved = repo.save.mock.calls[0][0];
    expect(saved.deletedBy).toBe('u1');
    expect(saved.deletedAt).toBeInstanceOf(Date);
    expect((saved.deletedAt as Date).getTime()).toBeGreaterThanOrEqual(before);
  });

  // findById
  it('findById: invalid uuid -> BadRequest', async () => {
    await expect(service.findById('not-uuid', 'u1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('findById: not found (throwError=true) -> NotFound', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findById(VALID_UUID, 'u1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('findById: not found (throwError=false) -> null', async () => {
    repo.findOne.mockResolvedValue(null);
    const out = await service.findById(VALID_UUID, 'u1', false);
    expect(out).toBeNull();
  });

  it('findById: user mismatch -> Forbidden', async () => {
    repo.findOne.mockResolvedValue({ id: VALID_UUID, user: 'owner' } as any);
    await expect(service.findById(VALID_UUID, 'other')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('findById: ok when user matches', async () => {
    const s = { id: VALID_UUID, user: 'u1' } as any;
    repo.findOne.mockResolvedValue(s);
    const out = await service.findById(VALID_UUID, 'u1');
    expect(out).toBe(s);
  });

  it('findById: ok when user guard disabled', async () => {
    const s = { id: VALID_UUID, user: 'uX' } as any;
    repo.findOne.mockResolvedValue(s);
    const out = await service.findById(VALID_UUID, null);
    expect(out).toBe(s);
  });

  // findAll
  it('findAll: user/q/isFavorite + date range + defaults', async () => {
    (rangeDateFilter as jest.Mock).mockReturnValue({
      createdAt: { $gte: 'FROM', $lte: 'TO' },
    });
    (paginateAndSort as jest.Mock).mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 10 },
    });

    const opts: GetAllSessionsDto = {
      user: 'u1',
      q: 'hello',
      isFavorite: true,
      fromDate: '2025-01-01' as any,
      toDate: '2025-12-31' as any,
    } as any;
    await service.findAll(opts);

    expect(rangeDateFilter).toHaveBeenCalledWith(opts.fromDate, opts.toDate);
    const args = (paginateAndSort as jest.Mock).mock.calls[0][1];
    expect(args.page).toBe(1);
    expect(args.limit).toBe(10);
    expect(args.query.user).toBe('u1');
    expect(args.query.createdAt).toEqual({ $gte: 'FROM', $lte: 'TO' });
    expect(args.query.title).toBeDefined(); // ILike
    expect(ILike).toBeDefined();
  });

  it('findAll: sort included when provided', async () => {
    (rangeDateFilter as jest.Mock).mockReturnValue({});
    (paginateAndSort as jest.Mock).mockResolvedValue({ data: [], meta: {} });
    (sortDeconstruct as jest.Mock).mockReturnValue({ createdAt: 'DESC' });

    const opts: GetAllSessionsDto = {
      user: 'u1',
      sortBy: 'createdAt',
      sort: 'desc',
    } as any;
    await service.findAll(opts);

    expect(sortDeconstruct).toHaveBeenCalledWith('createdAt', 'desc');
    const args = (paginateAndSort as jest.Mock).mock.calls[0][1];
    expect(args.order).toEqual({ createdAt: 'DESC' });
  });

  it('findAll: defaults page=1/limit=10', async () => {
    (rangeDateFilter as jest.Mock).mockReturnValue({});
    (paginateAndSort as jest.Mock).mockResolvedValue({ data: [], meta: {} });

    const opts: GetAllSessionsDto = { user: 'u1' } as any;
    await service.findAll(opts);
    const args = (paginateAndSort as jest.Mock).mock.calls[0][1];
    expect(args.page).toBe(1);
    expect(args.limit).toBe(10);
  });
});
