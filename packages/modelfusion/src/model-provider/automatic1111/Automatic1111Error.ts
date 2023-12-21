import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import {
  ResponseHandler,
  createJsonErrorResponseHandler,
} from "../../core/api/postToApi.js";
import { ZodSchema } from "../../core/schema/ZodSchema.js";

const automatic1111ErrorDataSchema = new ZodSchema(
  z.object({
    error: z.string(),
    detail: z.string(),
    body: z.string(),
    errors: z.string(),
  })
);

export type Automatic1111ErrorData =
  (typeof automatic1111ErrorDataSchema)["_type"];

export const failedAutomatic1111CallResponseHandler: ResponseHandler<ApiCallError> =
  createJsonErrorResponseHandler({
    errorSchema: automatic1111ErrorDataSchema,
    errorToMessage: (error) => error.detail,
  });
