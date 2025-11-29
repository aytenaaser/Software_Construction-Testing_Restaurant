import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { FeedbackService } from '../services/feedback.service';
import {
  CreateFeedbackDto,
  RespondToFeedbackDto,
  ModerateFeedbackDto,
  FeedbackResponseDto,
  FeedbackStatsDto,
} from '../dto/feedback-dto';
import { JwtAuthGuard } from '../auth/guards/authentication-guard';
import { RolesGuard } from '../auth/guards/authorization-guard';
import { Roles } from '../auth/decorators/roles-decorator';
import { UserRole } from '../models/user.schema';
import { Public } from '../auth/decorators/public-decorator';

@Controller('feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Request() req: any,
  ): Promise<FeedbackResponseDto> {
    const userId = req.user?.sub;
    return this.feedbackService.create(userId, createFeedbackDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('status') status?: string,
    @Query('isPublic') isPublic?: string,
  ): Promise<FeedbackResponseDto[]> {
    const filters: any = {};
    if (status) filters.status = status;
    if (isPublic !== undefined) filters.isPublic = isPublic === 'true';
    return this.feedbackService.findAll(filters);
  }

  @Get('my-feedback')
  @HttpCode(HttpStatus.OK)
  async getMyFeedback(@Request() req: any): Promise<FeedbackResponseDto[]> {
    const userId = req.user?.sub;
    return this.feedbackService.findByUser(userId);
  }

  @Public()
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats(): Promise<FeedbackStatsDto> {
    return this.feedbackService.getStats();
  }

  @Get('reservation/:id')
  @HttpCode(HttpStatus.OK)
  async findByReservation(@Param('id') reservationId: string): Promise<FeedbackResponseDto | null> {
    return this.feedbackService.findByReservation(reservationId);
  }

  @Put(':id/respond')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async respond(
    @Param('id') feedbackId: string,
    @Body() respondDto: RespondToFeedbackDto,
    @Request() req: any,
  ): Promise<FeedbackResponseDto> {
    const adminId = req.user?.sub;
    return this.feedbackService.respond(feedbackId, adminId, respondDto);
  }

  @Put(':id/moderate')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async moderate(
    @Param('id') feedbackId: string,
    @Body() moderateDto: ModerateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    return this.feedbackService.moderate(feedbackId, moderateDto);
  }
}

