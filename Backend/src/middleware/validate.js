import { ApiError } from "../utils/ApiError.js";

/**
 * Validate req[part] against a zod schema and replace it with the parsed value.
 * Usage: router.post("/", validate(schema), handler)
 */
export const validate = (schema, part = "body") => (req, _res, next) => {
  const result = schema.safeParse(req[part]);
  if (!result.success) {
    const first = result.error.issues[0];
    return next(
      ApiError.badRequest(
        `${first.path.join(".") || part}: ${first.message}`,
        "VALIDATION"
      )
    );
  }
  req[part] = result.data;
  next();
};
