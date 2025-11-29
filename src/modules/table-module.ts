/**
 * Table Module
 *
 * Encapsulates all table-related functionality
 * Follows Modular Architecture Principle
 * - Single responsibility: manages tables only
 * - Independently testable
 * - Loosely coupled with other modules
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Table, TableSchema } from '../models/Table.schema';
import { TableService } from '../services/table.service';
import { TableController } from '../controllers/table-controller';
import { AuthModule } from '../auth/auth-module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Table.name,
        schema: TableSchema,
      },
    ]),
  ],
  controllers: [TableController],
  providers: [TableService],
  exports: [TableService], // Export service for use in reservation module
})
export class TableModule {}

