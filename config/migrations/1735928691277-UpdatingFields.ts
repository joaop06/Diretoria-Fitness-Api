import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatingFields1735928691277 implements MigrationInterface {
    name = 'UpdatingFields1735928691277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`username\` varchar(100) NOT NULL after name`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`isVerified\` tinyint NOT NULL DEFAULT 0 after password`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`verificationCode\` int NULL after isVerified`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`verificationCode\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isVerified\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`username\``);
    }

}
