import { MigrationInterface, QueryRunner } from "typeorm";

export class NewFieldTotalParticipationsInUsers1735425006617 implements MigrationInterface {
    name = ' $npmConfigName1735425006617'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`system_logs\` DROP COLUMN \`env\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`totalParticipations\` int NOT NULL DEFAULT '0' after \`totalTrainingDays\``);
        await queryRunner.query(`ALTER TABLE \`system_logs\` ADD \`env\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`system_logs\` DROP COLUMN \`env\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`totalParticipations\``);
        await queryRunner.query(`ALTER TABLE \`system_logs\` ADD \`env\` varchar(255) NOT NULL`);
    }

}
