import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientRustPanicError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientValidationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': // Unique constraint violation
          statusCode = HttpStatus.CONFLICT;
          message = `Unique constraint failed on ${exception.meta.target}`;
          break;
        case 'P2003': // Foreign key constraint violation
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint violation';
          break;
        case 'P2025': // Record not found
          statusCode = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        default:
          message = exception.message;
          break;
      }
    } else {
      this.logger.error('Unhandled Prisma exception', exception);
    }

    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
