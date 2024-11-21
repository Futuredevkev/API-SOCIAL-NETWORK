import { MigrationInterface, QueryRunner } from "typeorm";

export class Oleetitimeo1730131869569 implements MigrationInterface {
    name = 'Oleetitimeo1730131869569'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "expiredAt"`);
        await queryRunner.query(`ALTER TABLE "chat" ADD "expiredAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "expiredAt"`);
        await queryRunner.query(`ALTER TABLE "chat" ADD "expiredAt" date`);
    }

}
