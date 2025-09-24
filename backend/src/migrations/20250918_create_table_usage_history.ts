import { QueryRunner, Table, TableIndex } from 'typeorm';
import type { MigrationInterface } from 'typeorm';

export class CreateTableUsageHistory20250918 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'table_usage_history',
        columns: [
          {
            name: 'usage_id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid'
          },
          { name: 'table_id', type: 'uuid', isNullable: false },
          { name: 'order_id', type: 'uuid', isNullable: true },
          { name: 'customer_name', type: 'varchar', length: '100', isNullable: true },
          { name: 'customer_phone', type: 'varchar', length: '20', isNullable: true },
          { name: 'guest_count', type: 'integer', isNullable: false },
          { name: 'start_time', type: 'timestamp', isNullable: false },
          { name: 'end_time', type: 'timestamp', isNullable: true },
          { name: 'duration_minutes', type: 'integer', isNullable: true },
          { name: 'total_order_amount', type: 'decimal', precision: 12, scale: 2, default: '0' },
          { name: 'total_payment_amount', type: 'decimal', precision: 12, scale: 2, default: '0' },
          { name: 'usage_type', type: 'varchar', length: '50', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'waiter_assigned', type: 'varchar', length: '100', isNullable: true },
          { name: 'order_placed_at', type: 'timestamp', isNullable: true },
          { name: 'food_served_at', type: 'timestamp', isNullable: true },
          { name: 'payment_completed_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' }
        ]
      }),
      true
    );

    await queryRunner.createIndex(
      'table_usage_history',
      new TableIndex({ name: 'IDX_table_usage_history_table_id', columnNames: ['table_id'] })
    );

    await queryRunner.createIndex(
      'table_usage_history',
      new TableIndex({ name: 'IDX_table_usage_history_start_time', columnNames: ['start_time'] })
    );

    await queryRunner.createIndex(
      'table_usage_history',
      new TableIndex({ name: 'IDX_table_usage_history_end_time', columnNames: ['end_time'] })
    );

    // Add foreign key constraint to tables.id (ON DELETE CASCADE)
    await queryRunner.query(
      `ALTER TABLE table_usage_history ADD CONSTRAINT FK_table_usage_history_table FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE table_usage_history DROP CONSTRAINT IF EXISTS FK_table_usage_history_table`);
    await queryRunner.dropIndex('table_usage_history', 'IDX_table_usage_history_table_id');
    await queryRunner.dropIndex('table_usage_history', 'IDX_table_usage_history_start_time');
    await queryRunner.dropIndex('table_usage_history', 'IDX_table_usage_history_end_time');
    await queryRunner.dropTable('table_usage_history', true);
  }
}
