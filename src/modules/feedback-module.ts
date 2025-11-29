import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Feedback, FeedbackSchema } from '../models/Feedback.schema';
import { Reservation, ReservationSchema } from '../models/Reservation.schema';
import { FeedbackService } from '../services/feedback.service';
import { FeedbackController } from '../controllers/feedback-controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Feedback.name, schema: FeedbackSchema },
      { name: Reservation.name, schema: ReservationSchema },
    ]),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}

