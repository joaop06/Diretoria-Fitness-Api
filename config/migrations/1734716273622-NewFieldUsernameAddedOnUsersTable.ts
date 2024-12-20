import { MigrationInterface, QueryRunner } from "typeorm";

export class NewFieldUsernameAddedOnUsersTable1734716273622 implements MigrationInterface {
    name = 'NewFieldUsernameAddedOnUsersTable1734716273622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`username\` varchar(100) NOT NULL after \`name\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`username\``);
    }

}
