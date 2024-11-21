import { MigrationInterface, QueryRunner } from "typeorm";

export class Oleetio1730128514601 implements MigrationInterface {
    name = 'Oleetio1730128514601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "expiredAt"`);
        await queryRunner.query(`ALTER TABLE "chat" ADD "expiredAt" date`);
        await queryRunner.query(`ALTER TABLE "group_chat" ADD "expiredAt" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_chat" DROP COLUMN "expiredAt"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "expiredAt"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "expiredAt" date`);
    }

}
