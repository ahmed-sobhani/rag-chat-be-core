import { BaseEntity } from '../../shared/entities/base-entity';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageEntity } from './mesage.entity';

@Index('IDX_SESSION_USER', ['user'])
@Index('IDX_SESSION_TITLE', ['user', 'title'])
@Index('IDX_SESSION_FAV', ['user', 'isFavorite'])
@Index('IDX_SESSION_CREATED', ['user', 'createdAt'])
@Entity('sessions')
export class SessionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 128, default: 'default' })
  user: string;

  @Column({ type: 'boolean', default: false })
  isFavorite: boolean;

  @OneToMany(() => MessageEntity, (msg) => msg.session)
  messages: MessageEntity[];
}
