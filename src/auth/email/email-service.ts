/**
 * Email Service
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles email sending operations
 * - Open/Closed: Can be extended with new email templates without modifying existing ones
 * - Dependency Inversion: Uses nodemailer abstraction
 *
 * Responsibilities:
 * - Configure email transporter
 * - Send verification emails with OTP
 * - Send password reset emails with OTP
 * - Send confirmation emails
 *
 * Programming Paradigms:
 * - IMPERATIVE: Step-by-step email sending with error handling
 * - DECLARATIVE: Email templates using HTML strings
 */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    /**
     * IMPERATIVE: Initialize email transporter with configuration
     * Step-by-step setup with verification
     */
    constructor() {

        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT || 587),
            secure: (process.env.SMTP_SECURE === 'true') || false,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD },
            logger: true,
            debug: true,
        });

        this.transporter.verify()
            .then(() => console.log('Mail transporter verified/connected OK'))
            .catch(err => console.error('Mail transporter verify error:',err));

    }



    /**
     * IMPERATIVE STYLE: Send verification email with OTP
     * Step-by-step email composition and sending
     */
    async sendVerificationEmail(email: string, otp: string) {
        console.log(`[MailService] Attempting to send verification email to: ${email}`);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Account Verification - Restaurant System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #8B5CF6;">Account Verification</h2>
                  <p>Hello,</p>
                  <p>Thank you for registering with our Restaurant Reservation system. Please use the code below to verify your account.</p>
                  <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                    <h1 style="font-size: 32px; color: #8B5CF6; margin: 0; letter-spacing: 5px;">${otp}</h1>
                  </div>
                  <p>This code will expire in 10 minutes.</p>
                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 12px; color: #6b7280;">This is an automated email. Please do not reply.</p>
                </div>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`[MailService] Verification email sent successfully to ${email}. Message ID: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error(`[MailService] Failed to send verification email to ${email}. Error:`, error);
            throw error; // Re-throw the error to be caught by the calling service
        }
    }

    /**
     * IMPERATIVE STYLE: Send password reset email with OTP
     * Step-by-step email composition and sending
     */
    async sendPasswordResetEmail(email: string, otp: string) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP - Education Platform',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #8B5CF6;">Password Reset Request</h2>
                  <p>Hello,</p>
                  <p>You requested to reset your password for your Educational Platform account.</p>
                  <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                    <h1 style="font-size: 32px; color: #8B5CF6; margin: 0; letter-spacing: 5px;">${otp}</h1>
                  </div>
                  <p>This code will expire in 10 minutes.</p>
                  <p>If you didn't request this, ignore this email.</p>
                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 12px; color: #6b7280;">Automated email from Educational Platform. Please do not reply.</p>
                </div>
            `,
        };

        return this.transporter.sendMail(mailOptions);
    }

    /**
     * IMPERATIVE STYLE: Send email verification confirmation
     * Step-by-step email composition and sending
     */
    async VerifiedEmail(email: string, otp: string) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Account Verification - Education Platform',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #8B5CF6;">Account Verification</h2>
                  <p>Hello,</p>
                  <p>Thank you for registering with Educational Platform. Your Account has been verified.</p>
                  <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                    <h1 style="font-size: 32px; color: #8B5CF6; margin: 0; letter-spacing: 5px;">${otp}</h1>
                  </div>
                  <p>This code will expire in 10 minutes.</p>
                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 12px; color: #6b7280;">Automated email from Educational Platform. Please do not reply.</p>
                </div>
            `,
        };

        return this.transporter.sendMail(mailOptions);
    }

    /**
     * Send reservation confirmation email
     * Called when reservation is created or approved
     */
    async sendReservationConfirmation(data: {
        email: string;
        customerName: string;
        reservationId: string;
        reservationDate: string;
        reservationTime: string;
        partySize: number;
        tableNumber?: string;
        hasPreOrder?: boolean;
    }) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: data.email,
            subject: '🎉 Reservation Confirmed - Restaurant Booking',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1>🎉 Reservation Confirmed!</h1>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p>Dear ${data.customerName},</p>
                        <p>Thank you for choosing our restaurant! Your reservation has been confirmed.</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3>Reservation Details:</h3>
                            <p><strong style="color: #667eea;">Confirmation Number:</strong> ${data.reservationId}</p>
                            <p><strong style="color: #667eea;">Date:</strong> ${data.reservationDate}</p>
                            <p><strong style="color: #667eea;">Time:</strong> ${data.reservationTime}</p>
                            <p><strong style="color: #667eea;">Party Size:</strong> ${data.partySize} guests</p>
                            ${data.tableNumber ? `<p><strong style="color: #667eea;">Table Number:</strong> ${data.tableNumber}</p>` : ''}
                            <p><strong style="color: #10b981;">Status:</strong> ✓ Confirmed</p>
                        </div>

                        ${data.hasPreOrder ? `
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3>🍽️ Pre-Order Confirmed</h3>
                            <p>Your pre-order has been received and will be prepared for your arrival.</p>
                        </div>
                        ` : ''}

                        <p><strong>Important Information:</strong></p>
                        <ul>
                            <li>Please arrive 10 minutes before your reservation time</li>
                            <li>If you need to modify or cancel, please do so at least 24 hours in advance</li>
                            <li>A valid ID may be required for party verification</li>
                        </ul>

                        <p>We look forward to serving you!</p>
                        <p>Best regards,<br>Restaurant Management Team</p>
                    </div>
                    <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
                        <p>This is an automated message. Please do not reply to this email.</p>
                    </div>
                </div>
            `,
        };

        return this.transporter.sendMail(mailOptions);
    }

    /**
     * Send reservation reminder email
     * Called by scheduled job for upcoming reservations
     */
    async sendReservationReminder(data: {
        email: string;
        customerName: string;
        reservationId: string;
        reservationDate: string;
        reservationTime: string;
        partySize: number;
        tableNumber?: string;
        hasPreOrder?: boolean;
    }) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: data.email,
            subject: '⏰ Reservation Reminder - Tomorrow!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1>⏰ Reservation Reminder</h1>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p>Dear ${data.customerName},</p>
                        
                        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px;">
                            <h3 style="margin-top: 0;">Your reservation is coming up soon!</h3>
                            <p style="font-size: 18px; margin: 0;"><strong>Tomorrow at ${data.reservationTime}</strong></p>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3>Reservation Details:</h3>
                            <p><strong style="color: #f59e0b;">Confirmation Number:</strong> ${data.reservationId}</p>
                            <p><strong style="color: #f59e0b;">Date:</strong> ${data.reservationDate}</p>
                            <p><strong style="color: #f59e0b;">Time:</strong> ${data.reservationTime}</p>
                            <p><strong style="color: #f59e0b;">Party Size:</strong> ${data.partySize} guests</p>
                            ${data.tableNumber ? `<p><strong style="color: #f59e0b;">Table Number:</strong> ${data.tableNumber}</p>` : ''}
                        </div>

                        ${data.hasPreOrder ? `
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3>🍽️ Your Pre-Order</h3>
                            <p>Your pre-order will be freshly prepared and ready upon your arrival.</p>
                        </div>
                        ` : ''}

                        <p><strong>Please Remember:</strong></p>
                        <ul>
                            <li>Arrive 10 minutes before your reservation time</li>
                            <li>Bring a valid ID for verification</li>
                            <li>If you need to cancel, please do so as soon as possible</li>
                        </ul>

                        <p>We're excited to see you soon!</p>
                        <p>Best regards,<br>Restaurant Management Team</p>
                    </div>
                    <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
                        <p>This is an automated reminder. Please do not reply to this email.</p>
                    </div>
                </div>
            `,
        };

        return this.transporter.sendMail(mailOptions);
    }

    /**
     * Send reservation cancellation email
     * Notifies customer that their reservation has been cancelled
     */
    async sendReservationCancellation(data: {
        email: string;
        customerName: string;
        reservationId: string;
        reservationDate: string;
        reservationTime: string;
        partySize: number;
        tableNumber?: string;
    }) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: data.email,
            subject: '❌ Reservation Cancelled - Restaurant Booking',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1>❌ Reservation Cancelled</h1>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p>Dear ${data.customerName},</p>
                        <p>Your reservation has been successfully cancelled.</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                            <h3 style="color: #ef4444; margin-top: 0;">Cancelled Reservation Details:</h3>
                            <p><strong style="color: #666;">Confirmation Number:</strong> ${data.reservationId}</p>
                            <p><strong style="color: #666;">Date:</strong> ${data.reservationDate}</p>
                            <p><strong style="color: #666;">Time:</strong> ${data.reservationTime}</p>
                            <p><strong style="color: #666;">Party Size:</strong> ${data.partySize} guests</p>
                            ${data.tableNumber ? `<p><strong style="color: #666;">Table Number:</strong> ${data.tableNumber}</p>` : ''}
                            <p><strong style="color: #ef4444;">Status:</strong> ✗ Cancelled</p>
                        </div>

                        <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 5px;">
                            <p style="margin: 0; color: #991b1b;"><strong>⚠️ Important:</strong></p>
                            <p style="margin: 10px 0 0 0; color: #991b1b;">Your table has been released and is now available for other customers.</p>
                        </div>

                        <p><strong>Need to Make a New Reservation?</strong></p>
                        <p>We'd love to see you again! You can make a new reservation at any time through our website or by contacting us directly.</p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Make New Reservation</a>
                        </div>

                        <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
                        
                        <p>Best regards,<br>Restaurant Management Team</p>
                    </div>
                    <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding: 20px;">
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>If you did not cancel this reservation, please contact us immediately.</p>
                    </div>
                </div>
            `,
        };

        return this.transporter.sendMail(mailOptions);
    }

}