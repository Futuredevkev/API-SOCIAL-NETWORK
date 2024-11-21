import { MigrationInterface, QueryRunner } from "typeorm";

export class Jijiajdso1730293666411 implements MigrationInterface {
    name = 'Jijiajdso1730293666411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "publication" ADD "communityId" uuid`);
        await queryRunner.query(`ALTER TABLE "publication" ADD CONSTRAINT "FK_a5b5da59f286d8ffc9a4bbc03b8" FOREIGN KEY ("communityId") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "publication" DROP CONSTRAINT "FK_a5b5da59f286d8ffc9a4bbc03b8"`);
        await queryRunner.query(`ALTER TABLE "publication" DROP COLUMN "communityId"`);
    }

}
