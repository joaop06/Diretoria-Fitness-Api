import { Response, Request } from "express";
import { getReasonPhrase } from "http-status-codes";
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";

export class Exception {
    constructor(options?: Error | HttpException | string | any) {
        const message = typeof options === 'string' ? options : options?.message;
        const status = options?.status || options?.statusCode || HttpStatus.BAD_REQUEST;
        const error = options?.response?.error || options?.name || getReasonPhrase(status);

        throw new HttpException({ message, error }, status);
    }
}

@Catch(HttpException)
export class AllExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        const message = typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message;
        const error = typeof exceptionResponse === 'object' && exceptionResponse['error'] ? exceptionResponse['error'] : exception.name;

        response.status(status).json({
            error,
            message: Array.isArray(message) ? message[0] : message,
        });
    }
}