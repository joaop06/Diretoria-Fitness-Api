import { MigrationInterface, QueryRunner } from "typeorm";

export class DropFieldPenaltyAmount1735935499514 implements MigrationInterface {
    name = 'DropFieldPenaltyAmount1735935499514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`participants\` DROP COLUMN \`penaltyAmount\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }

}
