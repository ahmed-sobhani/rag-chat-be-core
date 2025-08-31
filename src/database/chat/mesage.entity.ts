import { BaseEntity } from '../../shared/entities/base-entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { SessionEntity } from './session.entity';

@Index('IDX_MSG_SESSION', ['sessionId'])
@Index('IDX_MSG_MSG', ['sessionId', 'message'])
@Index('IDX_MSG_CREATED', ['sessionId', 'createdAt'])
@Entity('messages')
export class MessageEntity extends BaseEntity {
  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => SessionEntity, (session) => session.messages, {
    nullable: false,
  })
  @JoinColumn({ name: 'sessionId' })
  session: SessionEntity;

  @Column({ type: 'uuid' })
  sessionId: string;

  @Column({ type: 'text', nullable: false })
  message: string;

  @Column({ type: 'varchar', nullable: false })
  sender: string;

  @Column({ type: 'jsonb', nullable: true })
  metaData: Record<string, any>;
}
