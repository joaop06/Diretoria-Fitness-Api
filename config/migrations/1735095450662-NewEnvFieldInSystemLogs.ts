import { MigrationInterface, QueryRunner } from "typeorm";

export class NewEnvFieldInSystemLogs1735095450662 implements MigrationInterface {
    name = 'NewEnvFieldInSystemLogs1735095450662'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`system_logs\` ADD \`env\` varchar(255) NOT NULL after id`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`system_logs\` DROP COLUMN \`env\``);
    }

}
