import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Bad Request', errors: err.flatten() });
    return;
  }
  if (err && typeof err === 'object' && 'statusCode' in err) {
    const e = err as { statusCode: number; message?: string };
    res.status(e.statusCode).json({ error: e.message ?? 'Error' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
}
