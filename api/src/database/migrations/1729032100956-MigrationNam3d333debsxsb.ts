import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationNam3d333debsxsb1729032100956
  implements MigrationInterface
{
  name = 'MigrationNam3d333debsxsb1729032100956';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "hiddenChats" SET DEFAULT '{}'`,
    );

    await queryRunner.query(
      `UPDATE "user" SET "hiddenChats" = '{}' WHERE "hiddenChats" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "hiddenChats" DROP DEFAULT`,
    );
  }
}
