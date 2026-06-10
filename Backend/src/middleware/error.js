import { ApiError } from "../utils/ApiError.js";
import { logger } from "../config/logger.js";
import { isProd } from "../config/env.js";

export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const code = err.code || "INTERNAL";

  if (status >= 500) logger.error({ err }, "Unhandled error");

  res.status(status).json({
    error: {
      code,
      message:
        status >= 500 && isProd ? "Something went wrong" : err.message,
    },
  });
}
