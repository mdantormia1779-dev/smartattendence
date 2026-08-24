import { NextResponse } from "next/server";

/**
 * Centralized Application Error Classes & HTTP Helpers
 * Provides clean HTTP status mapping without leaking database internals.
 */

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code: string = "INTERNAL_SERVER_ERROR", details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", details?: any) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Permission denied: Insufficient role or access rights") {
    super(message, 403, "FORBIDDEN");
  }
}

export class TenantSecurityError extends AppError {
  constructor(message: string = "Cross-tenant access violation: Data isolated") {
    super(message, 403, "TENANT_ACCESS_DENIED");
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists or duplicate constraint violated") {
    super(message, 409, "CONFLICT");
  }
}

export class PlanLimitExceededError extends AppError {
  constructor(message: string = "Plan limit reached. Upgrade subscription to continue.") {
    super(message, 402, "PLAN_LIMIT_EXCEEDED");
  }
}

export function apiSuccess<T = any>(data: T, message: string = "Success", meta?: any, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

export function apiError(error: any) {
  console.error("[SERVER_API_ERROR]", error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        errors: error.details ? (Array.isArray(error.details) ? error.details : [error.details]) : [{ code: error.code, message: error.message }],
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // Zod validation error
  if (error && error.name === "ZodError") {
    const formattedErrors = error.errors?.map((e: any) => ({
      field: e.path?.join("."),
      message: e.message,
    })) || [{ message: "Validation error" }];

    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: formattedErrors,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: formattedErrors,
        },
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: "An unexpected server error occurred. Please try again later.",
      errors: [{ code: "INTERNAL_SERVER_ERROR", message: error?.message || "Internal server error" }],
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected server error occurred. Please try again later.",
      },
    },
    { status: 500 }
  );
}

export function handleApiError(error: any) {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: {
        success: false as const,
        message: error.message,
        errors: error.details ? (Array.isArray(error.details) ? error.details : [error.details]) : [{ code: error.code, message: error.message }],
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
    };
  }

  if (error && error.name === "ZodError") {
    const formattedErrors = error.errors?.map((e: any) => ({
      field: e.path?.join("."),
      message: e.message,
    })) || [{ message: "Validation error" }];

    return {
      statusCode: 400,
      body: {
        success: false as const,
        message: "Validation failed",
        errors: formattedErrors,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: formattedErrors,
        },
      },
    };
  }

  return {
    statusCode: 500,
    body: {
      success: false as const,
      message: "An unexpected server error occurred. Please try again later.",
      errors: [{ code: "INTERNAL_SERVER_ERROR", message: "Internal server error" }],
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected server error occurred. Please try again later.",
      },
    },
  };
}
