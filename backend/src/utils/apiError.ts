export class ApiError extends Error {
  public statusCode: number;
  public errors: string[];
  public success: boolean;

  constructor(
    statusCode: number,
    message = 'Something went wrong',
    errors: string[] = [],
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
