import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

config();
const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
    type: 'mysql',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_NAME'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    migrations: ['dist/config/migrations/*.js'],
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: !!configService.get('SYNCHRONIZE_DB'),
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
