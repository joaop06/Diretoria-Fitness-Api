import { MigrationInterface, QueryRunner } from "typeorm";

export class NewFieldsToVerificationUser1734980681939 implements MigrationInterface {
    name = 'NewFieldsToVerificationUser1734980681939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`isVerified\` tinyint NOT NULL DEFAULT 0 after password`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`verificationCode\` int NULL after isVerified`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`verificationCodeExpiresAt\` datetime NULL after verificationCode`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`verificationCodeExpiresAt\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`verificationCode\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isVerified\``);
    }

}
