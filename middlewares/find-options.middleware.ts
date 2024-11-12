import { ParsedQs } from 'qs';
import { FindOptionsDto } from '../dto/find.dto';
import { Response, Request, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class FindOptionsMiddleware<T> implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        try {
            req.query = new FindOptionsDto<T>(req.query) as unknown as ParsedQs;
            next();

        } catch (e) {
            next(e);
        }
    }
}