// TODO: Refactor code.

import { error } from "console";
import { NextFunction, Request, Response } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";

export enum HTTPSTATUS {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export type HttpStatusCodeType = HTTPSTATUS;

export enum ErrorCodeEnum {
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  ACCESS_UNAUTHORIZED = "ACCESS_UNAUTHORIZED",
  BAD_REQUEST = "BAD_REQUEST",
  JWT_EXPIRED = "JWT_EXPIRED",
  JWT_INVALID = "JWT_INVALID",
  INVALID_JSON_FORMAT = "INVALID_JSON_FORMAT",
}

export type ErrorCodeEnumType = ErrorCodeEnum;

export class AppError extends Error {
  public statusCode: HttpStatusCodeType;
  public errorCode: ErrorCodeEnumType;

  constructor(message: string, statusCode = HTTPSTATUS.INTERNAL_SERVER_ERROR, errorCode: ErrorCodeEnumType) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class HttpException extends AppError {
  constructor(message = "Http Exception Error", errorCode: ErrorCodeEnumType, statusCode: HttpStatusCodeType) {
    super(message, statusCode, errorCode);
  }
}

export class InternalServerException extends AppError {
  constructor(message = "Internal Server Error", errorCode: ErrorCodeEnumType, statusCode: HttpStatusCodeType) {
    super(message, statusCode, errorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR);
  }
}

export class BadRequestException extends AppError {
  constructor(message = "Bad Request", errorCode: ErrorCodeEnumType) {
    super(message, HTTPSTATUS.BAD_REQUEST, errorCode || ErrorCodeEnum.BAD_REQUEST);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = "Unauthorized Access", errorCode: ErrorCodeEnumType) {
    super(message, HTTPSTATUS.UNAUTHORIZED, errorCode || ErrorCodeEnum.ACCESS_UNAUTHORIZED);
  }
}

export class NotFoundException extends AppError {
  constructor(message = "Resource not found", errorCode?: ErrorCodeEnumType) {
    super(message, HTTPSTATUS.NOT_FOUND, errorCode || ErrorCodeEnum.RESOURCE_NOT_FOUND);
  }
}

// middlewares

export const notFoundMiddleware = (request: Request, response: Response, next: NextFunction) => {
  next(new NotFoundException("Route not found"));
};

export const formatZodError = (error: ZodError) => {
  const errors = error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return errors;
};

// TODO: reusable errorResponse

export const errorMiddleware = (err: Error | AppError, request: Request, response: Response, next: NextFunction) => {
  if (error instanceof SyntaxError) {
    return response.status(HTTPSTATUS.NOT_FOUND).json({
      message: error.message || ErrorCodeEnum.INVALID_JSON_FORMAT,
    });
  }

  if (error instanceof ZodError) {
    const errors = formatZodError(error);
    return response.status(HTTPSTATUS.BAD_REQUEST).json({
      message: ErrorCodeEnum.VALIDATION_ERROR,
      errors: errors,
    });
  }

  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      message: error.message,
    });
  }

  if (error instanceof TokenExpiredError) {
    return response.status(HTTPSTATUS.UNAUTHORIZED).json({
      message: error.message || ErrorCodeEnum.JWT_EXPIRED,
    });
  }

  if (error instanceof JsonWebTokenError) {
    return response.status(HTTPSTATUS.UNAUTHORIZED).json({
      message: error.message || ErrorCodeEnum.JWT_INVALID,
    });
  }

  return response.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: ErrorCodeEnum.INTERNAL_SERVER_ERROR,
  });
};
