import { MigrationInterface, QueryRunner } from "typeorm";

export class Oleetitimeosta1730132207081 implements MigrationInterface {
    name = 'Oleetitimeosta1730132207081'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_chat" DROP COLUMN "expiredAt"`);
        await queryRunner.query(`ALTER TABLE "group_chat" ADD "expiredAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_chat" DROP COLUMN "expiredAt"`);
        await queryRunner.query(`ALTER TABLE "group_chat" ADD "expiredAt" date`);
    }

}
