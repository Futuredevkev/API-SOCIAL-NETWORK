import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationNam3d333debxsb1729029529716
  implements MigrationInterface
{
  name = 'MigrationNam3d333debxsb1729029529716';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "hiddenGroups" SET DEFAULT '{}'`,
    );

    await queryRunner.query(
      `UPDATE "user" SET "hiddenGroups" = '{}' WHERE "hiddenGroups" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_ashei"`);
  }
}
