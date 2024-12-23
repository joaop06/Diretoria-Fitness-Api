import { MigrationInterface, QueryRunner } from "typeorm";

export class DropFieldVerificationCodeExpiresAt1734985072781 implements MigrationInterface {
    name = 'DropFieldVerificationCodeExpiresAt1734985072781'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`verificationCodeExpiresAt\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }

}
