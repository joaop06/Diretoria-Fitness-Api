import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1736132616693 implements MigrationInterface {
    name = ' $npmConfigName1736132616693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`weight\` \`weight\` decimal(5,2) NOT NULL DEFAULT '0.00'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`weight\` \`weight\` decimal(4,1) NOT NULL DEFAULT '0.0'`);
    }

}
