import { ObjectLiteral, Repository } from 'typeorm';

// Generic repository mock used across specs
// @ts-ignore
export const createRepoMock = <T extends ObjectLiteral>() =>
  ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }) as unknown as jest.Mocked<Repository<T>>;

export const resetRepoMock = (repo: jest.Mocked<Repository<any>>) => {
  for (const k of Object.keys(repo) as Array<keyof typeof repo>) {
    const fn = repo[k] as any;
    if (typeof fn?.mockReset === 'function') fn.mockReset();
  }
};

// Helper to mock uuid.v7 consistently inside tests
export const mockUuidV7 = (value = '00000000-0000-7000-8000-000000000000') => {
  jest.mock('uuid', () => ({ v7: jest.fn(() => value) }));
};

// Reset jest-mocked helpers you use a lot
export const resetHelperMocks = (helpers: any[]) => {
  helpers.forEach((h) => (h as jest.Mock)?.mockReset?.());
};
