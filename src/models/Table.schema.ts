// src/modules/tables/schemas/table.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TableDocument = Table & Document;

@Schema()
export class Table {
  @Prop({ required: true })
  capacity: number;

  @Prop({ default: true })
  isAvailable: boolean;
}

export const TableSchema = SchemaFactory.createForClass(Table);
