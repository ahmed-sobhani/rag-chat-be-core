import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  BaseEntity as TypeOrmBaseEntity,
} from 'typeorm';

export abstract class BaseEntity extends TypeOrmBaseEntity {
  public static userId: string;

  static setUserId(userId: string) {
    this.userId = userId;
  }

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt: Date;

  @Column({ type: 'varchar', length: 128, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  updatedBy: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  deletedBy: string;
}
