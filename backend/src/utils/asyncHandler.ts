import { Request, Response, NextFunction } from 'express';

/**
 * Async handler wrapper for Express route handlers
 * Catches async errors and passes them to Express error handling middleware
 */;
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  }
}
