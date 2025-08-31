import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query, Req,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AppGuard } from '../../shared/gaurds/app.guard';
import {
  CreateMessageDto,
  GetAllMessagesDto,
  MessageResponseDto,
} from '../DTOs';
import { plainToInstance } from 'class-transformer';
import { successHandler } from '../../shared/helpers/handlers';

@Controller({ path: 'chat/session', version: '1' })
@ApiHeader({ name: 'x-api-key', required: true, description: 'The API key' })
@ApiHeader({
  name: 'x-username',
  description: 'The username',
  example: 'default',
})
@UseGuards(AppGuard)
export class MessagesController {
  constructor(private readonly messageService: MessagesService) {}

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message to a chat session' })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Chat session not found' })
  @ApiBody({ type: CreateMessageDto })
  @ApiParam({
    name: 'id',
    description: 'The ID of the chat session',
    required: true,
  })
  async sendMessage(
    @Req() request: any,
    @Param('id') sessionId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const msg = await this.messageService.create(
      sessionId,
      request.user,
      createMessageDto,
    );
    const resp = plainToInstance(MessageResponseDto, msg, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
    return successHandler(resp, 'Message sent successfully');
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages from a chat session' })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    type: [MessageResponseDto],
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the chat session',
    required: true,
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10 })
  @ApiQuery({ name: 'afterId', required: false, type: String })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    example: 'createdAt',
  })
  @ApiQuery({ name: 'sort', required: false, type: String, example: 'ASC' })
  @ApiQuery({ name: 'fromDate', required: false, type: Date })
  @ApiQuery({ name: 'toDate', required: false, type: Date })
  async findAllMessage(
    @Param('id') sessionId: string,
    @Query() options: GetAllMessagesDto,
  ) {
    const msgs = await this.messageService.findAll(sessionId, options);
    const items = plainToInstance(MessageResponseDto, msgs.items, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
    return successHandler(
      { ...msgs, items },
      'Messages retrieved successfully',
    );
  }
}
