import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Feedback, FeedbackDocument, FeedbackStatus } from '../models/Feedback.schema';
import { Reservation, ReservationDocument } from '../models/Reservation.schema';
import {
  CreateFeedbackDto,
  RespondToFeedbackDto,
  ModerateFeedbackDto,
  FeedbackResponseDto,
  FeedbackStatsDto,
} from '../dto/feedback-dto';

/**
 * Feedback Service
 * User Story: "As a customer, I want to leave feedback and ratings"
 */
@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name)
    private feedbackModel: Model<FeedbackDocument>,
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
  ) {}

  /**
   * Submit feedback for a completed reservation
   */
  async create(userId: string, createFeedbackDto: CreateFeedbackDto): Promise<FeedbackResponseDto> {
    // Validate reservation
    if (!Types.ObjectId.isValid(createFeedbackDto.reservationId)) {
      throw new BadRequestException('Invalid reservation ID');
    }

    const reservation = await this.reservationModel.findById(createFeedbackDto.reservationId);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.userId.toString() !== userId) {
      throw new ForbiddenException('Not authorized to provide feedback for this reservation');
    }

    if (reservation.status !== 'completed') {
      throw new BadRequestException('Can only provide feedback for completed reservations');
    }

    // Check if feedback already exists
    const existing = await this.feedbackModel.findOne({
      reservationId: new Types.ObjectId(createFeedbackDto.reservationId)
    });
    if (existing) {
      throw new BadRequestException('Feedback already submitted for this reservation');
    }

    // Create feedback
    const feedback = new this.feedbackModel({
      ...createFeedbackDto,
      reservationId: new Types.ObjectId(createFeedbackDto.reservationId),
      userId: new Types.ObjectId(userId),
      isVerified: true, // Verified because linked to actual reservation
      status: FeedbackStatus.APPROVED, // Auto-approved - no confirmation needed
      isPublic: true, // Make it public immediately
    });

    const saved = await feedback.save();
    return this.mapToResponse(saved);
  }

  /**
   * Get all feedback (Admin)
   */
  async findAll(filters?: { status?: string; isPublic?: boolean }): Promise<FeedbackResponseDto[]> {
    const query: any = {};

    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.isPublic !== undefined) {
      query.isPublic = filters.isPublic;
    }

    const feedbacks = await this.feedbackModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return feedbacks.map(f => this.mapToResponse(f));
  }

  /**
   * Get user's feedback
   */
  async findByUser(userId: string): Promise<FeedbackResponseDto[]> {
    const feedbacks = await this.feedbackModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return feedbacks.map(f => this.mapToResponse(f));
  }

  /**
   * Get feedback for a reservation
   */
  async findByReservation(reservationId: string): Promise<FeedbackResponseDto | null> {
    if (!Types.ObjectId.isValid(reservationId)) {
      throw new BadRequestException('Invalid reservation ID');
    }

    const feedback = await this.feedbackModel
      .findOne({ reservationId: new Types.ObjectId(reservationId) })
      .lean()
      .exec();

    return feedback ? this.mapToResponse(feedback) : null;
  }

  /**
   * Admin respond to feedback
   */
  async respond(
    feedbackId: string,
    adminId: string,
    respondDto: RespondToFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    if (!Types.ObjectId.isValid(feedbackId)) {
      throw new BadRequestException('Invalid feedback ID');
    }

    const feedback = await this.feedbackModel.findById(feedbackId);
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    feedback.adminResponse = respondDto.adminResponse;
    feedback.respondedBy = new Types.ObjectId(adminId) as any;
    feedback.respondedAt = new Date();

    const updated = await feedback.save();
    return this.mapToResponse(updated);
  }

  /**
   * Moderate feedback (Approve/Reject)
   */
  async moderate(
    feedbackId: string,
    moderateDto: ModerateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    if (!Types.ObjectId.isValid(feedbackId)) {
      throw new BadRequestException('Invalid feedback ID');
    }

    const feedback = await this.feedbackModel.findById(feedbackId);
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    feedback.status = moderateDto.status as FeedbackStatus;
    if (moderateDto.moderationNote) {
      feedback.moderationNote = moderateDto.moderationNote;
    }
    feedback.isPublic = moderateDto.status === 'approved';

    const updated = await feedback.save();
    return this.mapToResponse(updated);
  }

  /**
   * Get feedback statistics
   */
  async getStats(): Promise<FeedbackStatsDto> {
    const feedbacks = await this.feedbackModel
      .find({ status: FeedbackStatus.APPROVED })
      .lean()
      .exec();

    if (feedbacks.length === 0) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        averageFoodQuality: 0,
        averageServiceQuality: 0,
        averageAmbience: 0,
        averageValueForMoney: 0,
        recommendationRate: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const total = feedbacks.length;
    const sumRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const sumFood = feedbacks.reduce((sum, f) => sum + (f.foodQuality || 0), 0);
    const sumService = feedbacks.reduce((sum, f) => sum + (f.serviceQuality || 0), 0);
    const sumAmbience = feedbacks.reduce((sum, f) => sum + (f.ambience || 0), 0);
    const sumValue = feedbacks.reduce((sum, f) => sum + (f.valueForMoney || 0), 0);
    const recommendCount = feedbacks.filter(f => f.wouldRecommend).length;

    const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach(f => {
      const rating = Math.round(f.rating) as 1 | 2 | 3 | 4 | 5;
      ratingDist[rating]++;
    });

    return {
      totalFeedback: total,
      averageRating: sumRating / total,
      averageFoodQuality: sumFood / total,
      averageServiceQuality: sumService / total,
      averageAmbience: sumAmbience / total,
      averageValueForMoney: sumValue / total,
      recommendationRate: (recommendCount / total) * 100,
      ratingDistribution: ratingDist,
    };
  }

  /**
   * Map to response DTO
   */
  private mapToResponse(feedback: any): FeedbackResponseDto {
    return {
      id: feedback._id.toString(),
      reservationId: feedback.reservationId.toString(),
      userId: feedback.userId.toString(),
      rating: feedback.rating,
      foodQuality: feedback.foodQuality,
      serviceQuality: feedback.serviceQuality,
      ambience: feedback.ambience,
      valueForMoney: feedback.valueForMoney,
      review: feedback.review,
      title: feedback.title,
      wouldRecommend: feedback.wouldRecommend || false,
      images: feedback.images || [],
      adminResponse: feedback.adminResponse,
      respondedBy: feedback.respondedBy?.toString(),
      respondedAt: feedback.respondedAt,
      status: feedback.status,
      moderationNote: feedback.moderationNote,
      isVerified: feedback.isVerified || false,
      helpfulCount: feedback.helpfulCount || 0,
      isPublic: feedback.isPublic || false,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    };
  }
}

