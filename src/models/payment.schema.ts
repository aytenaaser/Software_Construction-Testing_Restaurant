// src/modules/payments/schemas/payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

export enum PaymentMethod {
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    CASH = 'cash',
}

@Schema()
export class Payment {
    @Prop({ required: true, ref: 'Reservation' })
    reservationId: string;

    @Prop({ required: true, ref: 'User' })
    customerId: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ enum: PaymentMethod, required: true })
    method: PaymentMethod;

    @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop()
    completedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);