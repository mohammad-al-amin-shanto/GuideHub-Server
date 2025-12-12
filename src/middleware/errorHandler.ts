import { Request, Response, NextFunction } from "express";
import logger from "@/utils/logger";

export default function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || "Server Error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}
