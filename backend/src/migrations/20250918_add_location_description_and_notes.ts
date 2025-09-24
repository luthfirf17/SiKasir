import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationDescriptionAndNotes20250918 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tables" ADD COLUMN IF NOT EXISTS "location_description" text`);
    await queryRunner.query(`ALTER TABLE "tables" ADD COLUMN IF NOT EXISTS "notes" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tables" DROP COLUMN IF EXISTS "location_description"`);
    await queryRunner.query(`ALTER TABLE "tables" DROP COLUMN IF EXISTS "notes"`);
  }
}
