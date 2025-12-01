import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsMongoId,
  IsArray,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating feedback
 */
export class CreateFeedbackDto {
  @ApiProperty({
    description: 'Reservation ID for which feedback is being submitted',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsMongoId()
  reservationId: string;

  @ApiProperty({
    description: 'Overall rating (1-5 stars)',
    example: 4,
    minimum: 1,
    maximum: 5,
    required: true,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Food quality rating (1-5 stars)',
    example: 5,
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  foodQuality?: number;

  @ApiProperty({
    description: 'Service quality rating (1-5 stars)',
    example: 4,
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  serviceQuality?: number;

  @ApiProperty({
    description: 'Ambience rating (1-5 stars)',
    example: 5,
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  ambience?: number;

  @ApiProperty({
    description: 'Value for money rating (1-5 stars)',
    example: 4,
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  valueForMoney?: number;

  @ApiProperty({
    description: 'Detailed review text (10-1000 characters)',
    example: 'Amazing experience! The food was delicious and the service was excellent. Highly recommend the grilled salmon.',
    minLength: 10,
    maxLength: 1000,
    required: true,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  review: string;

  @ApiProperty({
    description: 'Title for the review',
    example: 'Great dining experience!',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiProperty({
    description: 'Would you recommend this restaurant?',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  wouldRecommend?: boolean;

  @ApiProperty({
    description: 'Array of image URLs',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

/**
 * DTO for admin response
 */
export class RespondToFeedbackDto {
  @ApiProperty({
    description: 'Admin response to customer feedback (10-500 characters)',
    example: 'Thank you for your feedback! We are glad you enjoyed your experience. We look forward to serving you again soon.',
    minLength: 10,
    maxLength: 500,
    required: true,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  adminResponse: string;
}

/**
 * DTO for moderation
 */
export class ModerateFeedbackDto {
  @ApiProperty({
    description: 'Moderation status',
    example: 'approved',
    enum: ['approved', 'rejected'],
    enumName: 'ModerationStatus',
    required: true,
  })
  @IsString()
  status: 'approved' | 'rejected';

  @ApiProperty({
    description: 'Internal note about moderation decision',
    example: 'Feedback meets community guidelines',
    required: false,
  })
  @IsOptional()
  @IsString()
  moderationNote?: string;
}

/**
 * Response DTO for feedback
 */
export class FeedbackResponseDto {
  id: string;
  reservationId: string;
  userId: string;
  rating: number;
  foodQuality?: number;
  serviceQuality?: number;
  ambience?: number;
  valueForMoney?: number;
  review: string;
  title?: string;
  wouldRecommend: boolean;
  images: string[];
  adminResponse?: string;
  respondedBy?: string;
  respondedAt?: Date;
  status: string;
  moderationNote?: string;
  isVerified: boolean;
  helpfulCount: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for feedback statistics
 */
export class FeedbackStatsDto {
  totalFeedback: number;
  averageRating: number;
  averageFoodQuality: number;
  averageServiceQuality: number;
  averageAmbience: number;
  averageValueForMoney: number;
  recommendationRate: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

