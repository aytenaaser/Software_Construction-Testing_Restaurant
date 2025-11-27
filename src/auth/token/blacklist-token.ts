import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {Document, HydratedDocument} from 'mongoose';

export type BlackListedTokenDocument = HydratedDocument<BlacklistedToken>;

@Schema({ timestamps: true })
export class BlacklistedToken {
    @Prop({ required: true, unique: true })
    token!: string;

    @Prop({ required: true })
    expiresAt?: Date;
}

export const BlacklistedTokenSchema = SchemaFactory.createForClass(BlacklistedToken);
BlacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });



export function normalizeBearerToken(raw?: string | null): string | null {
    if (!raw) return null;
    const m = raw.match(/^\s*Bearer\s+(.+)$/i);
    return m ? m[1] : raw.trim();
}