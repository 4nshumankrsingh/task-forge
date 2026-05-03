import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[Error]", err.message);

  if (err.message.includes("Unique constraint")) {
    return res.status(409).json({
      success: false,
      error: "A record with this data already exists.",
    });
  }

  return res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Something went wrong on our end."
        : err.message,
  });
}