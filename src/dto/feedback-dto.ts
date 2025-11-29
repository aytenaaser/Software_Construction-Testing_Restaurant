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

/**
 * DTO for creating feedback
 */
export class CreateFeedbackDto {
  @IsMongoId()
  reservationId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  foodQuality?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  serviceQuality?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  ambience?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  valueForMoney?: number;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  review: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsBoolean()
  wouldRecommend?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

/**
 * DTO for admin response
 */
export class RespondToFeedbackDto {
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  adminResponse: string;
}

/**
 * DTO for moderation
 */
export class ModerateFeedbackDto {
  @IsString()
  status: 'approved' | 'rejected';

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

