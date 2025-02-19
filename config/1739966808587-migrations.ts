import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1739966808587 implements MigrationInterface {
    name = 'Migrations1739966808587'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`verificationCodeAt\` datetime NULL after \`verificationCode\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`verificationCodeAt\``);
    }

}
