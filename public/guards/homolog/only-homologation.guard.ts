import {
    Injectable,
    CanActivate,
    HttpException,
    ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class OnlyHomologGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const isOnlyHomolog = this.reflector.get<boolean>(
            'onlyHomolog',
            context.getHandler(),
        );

        // Se o decorador não estiver presente, permita o acesso
        if (!isOnlyHomolog) return true;

        const currentEnv = process.env.NODE_ENV;

        if (currentEnv === 'development') {
            return true;
        }

        throw new HttpException('Not Found', 404);
    }
}