import { ClsService } from 'nestjs-cls';

import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(
    dataSource: DataSource,
    private readonly cls: ClsService,
  ) {
    dataSource.subscribers.push(this);
  }

  beforeInsert(event: InsertEvent<any>) {
    const userId = this.cls.get('userId');
    if (event?.entity && userId) {
      event.entity.createdBy = userId;
    }
  }

  beforeUpdate(event: UpdateEvent<any>) {
    const userId = this.cls.get('userId');
    if (event?.entity && userId) {
      event.entity.updatedBy = userId;
    }
  }
}
