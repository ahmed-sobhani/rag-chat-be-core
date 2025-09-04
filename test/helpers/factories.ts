import { v7 as uuidv7 } from 'uuid';
import { SessionEntity } from '../../src/database/chat/session.entity';
import { MessageEntity } from '../../src/database/chat/mesage.entity';

export const makeSession = (
  overrides: Partial<SessionEntity> = {},
): SessionEntity =>
  <SessionEntity>{
    id: overrides.id ?? uuidv7(),
    title: overrides.title ?? 'Session A',
    user: overrides.user ?? 'user-1',
    isFavorite: overrides.isFavorite ?? false,
    deletedAt: overrides.deletedAt ?? null,
    deletedBy: overrides.deletedBy ?? null,
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
    ...overrides,
  };

export const makeMessage = (
  overrides: Partial<MessageEntity> = {},
): MessageEntity =>
  <MessageEntity>{
    id: overrides.id ?? uuidv7(),
    sessionId: overrides.sessionId ?? 'session-1',
    sender: overrides.sender ?? 'user-1',
    message: overrides.message ?? 'hello',
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
    ...overrides,
  };
