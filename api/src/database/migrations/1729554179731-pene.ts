import { MigrationInterface, QueryRunner } from "typeorm";

export class Pene1729554179731 implements MigrationInterface {
    name = 'Pene1729554179731'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "expiredAt" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "expiredAt"`);
    }

}
