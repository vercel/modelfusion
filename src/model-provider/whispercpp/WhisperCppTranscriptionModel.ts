import { z } from "zod";
import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { ApiConfiguration } from "../../core/api/ApiConfiguration.js";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle.js";
import { ResponseHandler, postToApi } from "../../core/api/postToApi.js";
import { ZodSchema } from "../../core/schema/ZodSchema.js";
import { safeParseJSON } from "../../core/schema/parseJSON.js";
import { AbstractModel } from "../../model-function/AbstractModel.js";
import {
  TranscriptionModel,
  TranscriptionModelSettings,
} from "../../model-function/generate-transcription/TranscriptionModel.js";
import { WhisperCppApiConfiguration } from "./WhisperCppApiConfiguration.js";

export interface WhisperCppTranscriptionModelSettings
  extends TranscriptionModelSettings {
  api?: ApiConfiguration;

  temperature?: number;
}

export type WhisperCppTranscriptionInput = {
  type: "wav";
  data: Buffer;
};

export class WhisperCppTranscriptionModel
  extends AbstractModel<WhisperCppTranscriptionModelSettings>
  implements
    TranscriptionModel<
      WhisperCppTranscriptionInput,
      WhisperCppTranscriptionModelSettings
    >
{
  constructor(settings: WhisperCppTranscriptionModelSettings) {
    super({ settings });
  }

  readonly provider = "whispercpp" as const;
  readonly modelName = null;

  async doTranscribe(
    data: WhisperCppTranscriptionInput,
    options?: FunctionOptions
  ) {
    const response = await this.callAPI(data, {
      functionId: options?.functionId,
      run: options?.run,
    });

    return {
      response,
      transcription: response.text,
    };
  }

  async callAPI(data: WhisperCppTranscriptionInput, options: FunctionOptions) {
    const { temperature } = this.settings;
    const api = this.settings.api ?? new WhisperCppApiConfiguration();

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () => {
        const formData = new FormData();
        formData.append("file", new Blob([data.data]), `audio.${data.type}`);
        formData.append("response_format", "json");

        if (temperature != null) {
          formData.append("temperature", temperature.toString());
        }

        return postToApi({
          url: api.assembleUrl("/inference"),
          headers: api.headers,
          body: {
            content: formData,
            values: { temperature },
          },
          failedResponseHandler,
          successfulResponseHandler,
          abortSignal: options?.run?.abortSignal,
        });
      },
    });
  }

  get settingsForEvent(): Partial<WhisperCppTranscriptionModelSettings> {
    return {
      temperature: this.settings.temperature,
    };
  }

  withSettings(additionalSettings: WhisperCppTranscriptionModelSettings) {
    return new WhisperCppTranscriptionModel(
      Object.assign({}, this.settings, additionalSettings)
    ) as this;
  }
}

const whisperCppTranscriptionJsonSchema = new ZodSchema(
  z.union([z.object({ text: z.string() }), z.object({ error: z.string() })])
);

const successfulResponseHandler: ResponseHandler<{
  text: string;
}> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();

  const parsedResult = safeParseJSON({
    text: responseBody,
    schema: whisperCppTranscriptionJsonSchema,
  });

  if (!parsedResult.success) {
    throw new ApiCallError({
      message: "Invalid JSON response",
      cause: parsedResult.error,
      statusCode: response.status,
      responseBody,
      url,
      requestBodyValues,
    });
  }

  if ("error" in parsedResult.data) {
    throw new ApiCallError({
      message: parsedResult.data.error,
      statusCode: response.status,
      responseBody,
      url,
      requestBodyValues,
    });
  }

  return {
    text: parsedResult.data.text.trim(),
  };
};

const failedResponseHandler: ResponseHandler<ApiCallError> = async ({
  response,
  url,
  requestBodyValues,
}) => {
  const responseBody = await response.text();

  return new ApiCallError({
    message: responseBody,
    url,
    requestBodyValues,
    statusCode: response.status,
    responseBody,
  });
};
