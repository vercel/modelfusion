import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import {
  ResponseHandler,
  createJsonErrorResponseHandler,
} from "../../core/api/postToApi.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";

const automatic1111ErrorDataSchema = z.object({
  error: z.string(),
  detail: z.string(),
  body: z.string(),
  errors: z.string(),
});

export type Automatic1111ErrorData = z.infer<
  typeof automatic1111ErrorDataSchema
>;

export const failedAutomatic1111CallResponseHandler: ResponseHandler<ApiCallError> =
  createJsonErrorResponseHandler({
    errorSchema: zodSchema(automatic1111ErrorDataSchema),
    errorToMessage: (error) => error.detail,
  });
