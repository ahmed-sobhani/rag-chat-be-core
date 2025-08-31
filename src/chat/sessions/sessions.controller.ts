import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import {
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AppGuard } from '../../shared/gaurds/app.guard';
import {
  CreateSessionDto,
  GetAllSessionsDto,
  SessionResponseDto,
  UpdateSessionDto,
} from '../DTOs';
import { IRequest } from '../../shared/interfaces/request';
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
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chat' })
  @ApiBody({ type: CreateSessionDto })
  @ApiOkResponse({
    type: SessionResponseDto,
    description: 'Session created successfully',
  })
  async createSession(
    // @ts-ignore
    @Req() request: IRequest,
    @Body() body: CreateSessionDto,
  ) {
    const session = await this.sessionsService.create(body, request.user);
    const resp = plainToInstance(SessionResponseDto, session, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
    return successHandler(resp, 'Session created successfully');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing chat' })
  @ApiBody({ type: UpdateSessionDto })
  @ApiParam({
    name: 'id',
    type: 'string',
    required: true,
    description: 'The ID of the chat to update',
  })
  @ApiOkResponse({
    type: SessionResponseDto,
    description: 'Session updated successfully',
  })
  async updateSession(
    // @ts-ignore
    @Req() request: IRequest,
    @Body() body: UpdateSessionDto,
    @Param('id') id: string,
  ) {
    const session = await this.sessionsService.patch(id, body, request.user);
    const resp = plainToInstance(SessionResponseDto, session, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
    return successHandler(resp, 'Session updated successfully');
  }

  @Patch(':id/favorite')
  @ApiOperation({ summary: 'Mark/Unmark a chat as favorite' })
  @ApiParam({
    name: 'id',
    type: 'string',
    required: true,
    description: 'The ID of the chat to mark/unmark as favorite',
  })
  @ApiOkResponse({
    type: SessionResponseDto,
    description: 'Session favorite status updated successfully',
  })
  async toggleFavorite(
    // @ts-ignore
    @Req() request: IRequest,
    @Param('id') id: string,
  ) {
    const session = await this.sessionsService.toggleFavorite(id, request.user);
    const resp = plainToInstance(SessionResponseDto, session, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
    return successHandler(resp, 'Session favorite status updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a chat' })
  @ApiParam({
    name: 'id',
    type: 'string',
    required: true,
    description: 'The ID of the chat to delete',
  })
  @ApiOkResponse({
    description: 'Session deleted successfully',
  })
  async deleteSession(
    // @ts-ignore
    @Req() request: IRequest,
    @Param('id') id: string,
  ) {
    await this.sessionsService.delete(id, request.user);
    return successHandler(null, 'Session deleted successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all chat' })
  @ApiOkResponse({
    type: [SessionResponseDto],
    description: 'List of chat',
  })
  @ApiQuery({ name: 'page', required: true, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: true, type: Number, example: 10 })
  @ApiQuery({ name: 'isFavorite', required: false, type: Boolean })
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
  async getAllSessions(
    // @ts-ignore
    @Req() request: IRequest,
    @Query() query: GetAllSessionsDto,
  ) {
    const sessions = await this.sessionsService.findAll({
      ...query,
      user: request.user,
    });
    const items = plainToInstance(SessionResponseDto, sessions.items, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
    return successHandler(
      { ...sessions, items },
      'List of chat fetched successfully',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a chat by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    required: true,
    description: 'The ID of the chat to retrieve',
  })
  @ApiOkResponse({
    type: SessionResponseDto,
    description: 'Session fetched successfully',
  })
  async getSessionById(
    // @ts-ignore
    @Req() request: IRequest,
    @Param('id') id: string,
  ) {
    const session = await this.sessionsService.findById(id, request.user);
    const resp = plainToInstance(SessionResponseDto, session, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
    return successHandler(resp, 'Session fetched successfully');
  }
}
