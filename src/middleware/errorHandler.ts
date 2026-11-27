import { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function errorHandler(
  err: Error & { status?: number; statusCode?: number; code?: string; type?: string },
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof SyntaxError && (err.status === 400 || err.type === 'entity.parse.failed')) {
    return res.status(400).json({ message: 'JSON inválido en el cuerpo de la solicitud' });
  }

  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    console.error('Error no controlado:', err);
    return res.status(status).json({
      message: status === 503 || status === 504 ? err.message : 'Error interno del servidor',
      ...(err.code ? { code: err.code } : {})
    });
  }

  return res.status(status).json({
    message: err.message,
    ...(err.code ? { code: err.code } : {})
  });
}
