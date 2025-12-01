import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation, ReservationDocument } from '../models/Reservation.schema';
import { MailService } from '../auth/email/email-service';

/**
 * Reservation Reminder Service
 * Sends automated reminders to customers 24 hours before their reservation
 * 
 * User Story: "The system shall send automated reservation confirmations and reminders via email"
 */
@Injectable()
export class ReservationReminderService {
  private readonly logger = new Logger(ReservationReminderService.name);

  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    private readonly mailService: MailService,
  ) {}

  /**
   * Cron job that runs once per day at 9:00 AM to send reminders
   * Sends reminders for all reservations happening tomorrow (24 hours from now)
   * Schedule: Every day at 9:00 AM
   */
  @Cron('0 9 * * *', {
    name: 'send-reservation-reminders',
    timeZone: 'Africa/Cairo', // Adjust to your timezone
  })
  async handleReservationReminders() {
    this.logger.log('Running reservation reminder check...');

    try {
      const reminders = await this.findReservationsNeedingReminders();
      
      if (reminders.length === 0) {
        this.logger.log('No reservations need reminders at this time');
        return;
      }

      this.logger.log(`Found ${reminders.length} reservations needing reminders`);

      // Send reminders
      for (const reservation of reminders) {
        await this.sendReminder(reservation);
      }

      this.logger.log(`Successfully sent ${reminders.length} reminder(s)`);
    } catch (error) {
      this.logger.error('Error in reservation reminder job', error);
    }
  }

  /**
   * Find reservations that need reminders
   * - Reservation date is tomorrow (24 hours from now)
   * - Status is 'confirmed'
   * - Reminder not yet sent (reminderSent = false or undefined)
   */
  private async findReservationsNeedingReminders(): Promise<ReservationDocument[]> {
    const now = new Date();
    
    // Calculate tomorrow's date range (24 hours from now, +/- 1 hour buffer)
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // Convert to DD/MM/YYYY format for comparison
    const tomorrowFormatted = this.formatDateToDDMMYYYY(tomorrow);

    this.logger.debug(`Looking for reservations on date: ${tomorrowFormatted}`);

    // Find confirmed reservations for tomorrow that haven't received reminders
    const reservations = await this.reservationModel
      .find({
        reservationDate: tomorrowFormatted,
        status: 'confirmed',
        $or: [
          { reminderSent: false },
          { reminderSent: { $exists: false } }
        ]
      })
      .populate('userId', 'name email')
      .exec();

    return reservations;
  }

  /**
   * Send reminder email to customer
   */
  private async sendReminder(reservation: any): Promise<void> {
    try {
      const user = reservation.userId;
      
      if (!user || !user.email) {
        this.logger.warn(`Cannot send reminder - user email not found for reservation ${reservation._id}`);
        return;
      }

      const customerName = user.name || 'Valued Customer';
      const reservationDate = reservation.reservationDate;
      const reservationTime = reservation.reservationTime;
      const partySize = reservation.partySize;
      const tableNumber = reservation.tableNumber || 'TBD';

      // Send reminder email
      await this.mailService.sendReservationReminder({
        email: user.email,
        customerName,
        reservationId: reservation._id.toString(),
        reservationDate,
        reservationTime,
        partySize,
        tableNumber,
        hasPreOrder: !!reservation.preOrder,
      });

      // Mark reminder as sent
      await this.reservationModel.updateOne(
        { _id: reservation._id },
        { 
          reminderSent: true,
          reminderSentAt: new Date()
        }
      );

      this.logger.log(`Reminder sent successfully to ${user.email} for reservation ${reservation._id}`);
    } catch (error) {
      this.logger.error(`Failed to send reminder for reservation ${reservation._id}`, error);
    }
  }

  /**
   * Helper: Format date to DD/MM/YYYY
   */
  private formatDateToDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Manual trigger for testing (can be called via endpoint)
   */
  async triggerReminderCheck(): Promise<{ sent: number; reservations: any[] }> {
    this.logger.log('Manual reminder check triggered');
    
    const reservations = await this.findReservationsNeedingReminders();
    
    for (const reservation of reservations) {
      await this.sendReminder(reservation);
    }

    return {
      sent: reservations.length,
      reservations: reservations.map(r => ({
        id: r._id,
        date: r.reservationDate,
        time: r.reservationTime,
        customer: (r.userId as any)?.email
      }))
    };
  }
}

