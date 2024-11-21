import { MigrationInterface, QueryRunner } from "typeorm";

export class Lechedemipa1732142899482 implements MigrationInterface {
    name = 'Lechedemipa1732142899482'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "face_file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" date NOT NULL DEFAULT now(), "updated_at" date NOT NULL DEFAULT now(), "url" text NOT NULL, "user_id" uuid, CONSTRAINT "REL_4450bd6f17b17997c6bb872fb5" UNIQUE ("user_id"), CONSTRAINT "PK_37a6904a681db7188e4e0fbbc10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "face_encoding" text`);
        await queryRunner.query(`ALTER TABLE "face_file" ADD CONSTRAINT "FK_4450bd6f17b17997c6bb872fb5c" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "face_file" DROP CONSTRAINT "FK_4450bd6f17b17997c6bb872fb5c"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "face_encoding"`);
        await queryRunner.query(`DROP TABLE "face_file"`);
    }

}
