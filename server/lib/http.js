export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

// Express 5 forwards errors thrown/rejected in async handlers here automatically.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = err.status || 500;
  let message = err.message || "Internal server error";

  if (err?.name === "ZodError") {
    status = 400;
    message = err.issues?.[0]?.message || "Invalid request data";
  } else if (err?.code === "LIMIT_FILE_SIZE") {
    status = 413;
    message = "File size should be less than 5MB";
  } else if (err?.type === "entity.too.large") {
    status = 413;
    message = "Request body too large";
  }

  if (status >= 500) {
    console.error(err);
    if (process.env.NODE_ENV === "production") message = "Internal server error";
  }

  res.status(status).json({ success: false, error: message });
}
