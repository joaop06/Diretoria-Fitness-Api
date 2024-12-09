import { Type } from 'class-transformer';
import { FindManyOptions, Entity } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { IsNumber, IsOptional, IsObject, validateSync } from 'class-validator';

function buildOptions(object: object) {
    return new FindOptionsDto(object);
}

export { buildOptions };

export class FindReturnModelDto<T> {
    rows: T[];
    count: number;
}
export class FindOptionsDto<T> implements FindManyOptions {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    skip?: number = 0;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    take?: number = 10;

    @IsObject()
    @IsOptional()
    where?: Partial<T>;

    @IsObject()
    @IsOptional()
    order?: Record<string, 'ASC' | 'DESC'> = { createdAt: 'DESC' };

    constructor(query: any = {}) {
        this.buildWhereClause(query);
        this.buildOrdenation(query.order);
        this.skip = query?.skip ? Number(query.skip) : this.skip;
        this.take = query?.take ? Number(query.take) : this.take;

        const errors = validateSync(this);
        if (errors.length > 0) {
            throw new BadRequestException('Parâmetros de busca inválidos');
        }
    }

    buildWhereClause(query: object) {
        this.where = {};
        Object.keys(query).map(key => {
            if (!['skip', 'take', 'order'].includes(key)) {
                this.where[key] = query[key]
            }
        })
    }

    buildOrdenation(order: string) {
        try {
            const e = new Error();
            let ordenation: Array<any>;
            if (order.startsWith('[[')) ordenation = JSON.parse(order);

            if (!ordenation.length) {
                // Declara erro para aplicar ordenação padrão
                throw e;
            }

            this.order = {};
            ordenation.forEach(i => {
                let [field, direction] = i.map(i => i.trim());
                if (!field) throw e;

                direction = direction.toUpperCase();
                this.order[field] = !['ASC', 'DESC'].includes(direction) ? 'ASC' : direction
            })

        } catch (e) {
            this.order = { createdAt: 'DESC' };
        }
    }
}