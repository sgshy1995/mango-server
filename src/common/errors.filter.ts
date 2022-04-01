import {StatusException} from './exception';
import {ArgumentsHost, Catch, ExceptionFilter, Injectable} from '@nestjs/common';

@Injectable()
@Catch(StatusException)
export class StatusFilter implements ExceptionFilter {
    catch(exception: StatusException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        console.log(`Setting status to ${status}`);
        // @ts-ignore
        response.status(status).json(exception.message);
    }
}