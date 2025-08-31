import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from '../database/chat/session.entity';
import { SessionsController } from './sessions/sessions.controller';
import { SessionsService } from './sessions/sessions.service';
import { MessageEntity } from '../database/chat/mesage.entity';
import { MessagesController } from './messages/messages.controller';
import { MessagesService } from './messages/messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity, MessageEntity])],
  controllers: [SessionsController, MessagesController],
  providers: [SessionsService, MessagesService],
  exports: [],
})
export class ChatModule {}
