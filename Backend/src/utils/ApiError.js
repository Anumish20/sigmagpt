export class ApiError extends Error {
  constructor(status, message, code = "ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }

  static badRequest(msg, code) {
    return new ApiError(400, msg, code || "BAD_REQUEST");
  }
  static notFound(msg = "Not found", code) {
    return new ApiError(404, msg, code || "NOT_FOUND");
  }
  static internal(msg = "Something went wrong", code) {
    return new ApiError(500, msg, code || "INTERNAL");
  }
  static badGateway(msg = "Upstream error", code) {
    return new ApiError(502, msg, code || "BAD_GATEWAY");
  }
}
