import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';
import { Observable, throwError } from 'rxjs';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Check if this is an error response from a microservice
    if (exception.message && typeof exception.message === 'object') {
      const error = exception.message;
      const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Internal server error';

      return response.status(statusCode).json({
        statusCode,
        message,
        timestamp: new Date().toISOString(),
      });
    }

    // Handle RpcException
    if (exception instanceof RpcException) {
      const error = exception.getError();
      const statusCode =
        error['statusCode'] || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        typeof error === 'string'
          ? error
          : error['message'] || 'Internal server error';

      return response.status(statusCode).json({
        statusCode,
        message,
        timestamp: new Date().toISOString(),
      });
    }

    // Handle standard HTTP exceptions
    const status =
      exception.status ||
      exception.statusCode ||
      HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception.response?.message ||
      exception.message ||
      'Internal server error';

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
