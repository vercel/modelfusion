import { z } from "zod";
import { FunctionCallOptions } from "../../core/FunctionOptions";
import { ApiCallError } from "../../core/api/ApiCallError";
import { ApiConfiguration } from "../../core/api/ApiConfiguration";
import { callWithRetryAndThrottle } from "../../core/api/callWithRetryAndThrottle";
import { ResponseHandler, postToApi } from "../../core/api/postToApi";
import { zodSchema } from "../../core/schema/ZodSchema";
import { safeParseJSON } from "../../core/schema/parseJSON";
import { AbstractModel } from "../../model-function/AbstractModel";
import {
  TranscriptionModel,
  TranscriptionModelSettings,
} from "../../model-function/generate-transcription/TranscriptionModel";
import { getAudioFileExtension } from "../../util/audio/getAudioFileExtension";
import {
  DataContent,
  convertDataContentToUint8Array,
} from "../../util/format/DataContent";
import { WhisperCppApiConfiguration } from "./WhisperCppApiConfiguration";

export interface WhisperCppTranscriptionModelSettings
  extends TranscriptionModelSettings {
  api?: ApiConfiguration;

  temperature?: number;
}

export class WhisperCppTranscriptionModel
  extends AbstractModel<WhisperCppTranscriptionModelSettings>
  implements TranscriptionModel<WhisperCppTranscriptionModelSettings>
{
  constructor(settings: WhisperCppTranscriptionModelSettings) {
    super({ settings });
  }

  readonly provider = "whispercpp" as const;
  readonly modelName = null;

  async doTranscribe(
    {
      audioData,
      mimeType,
    }: {
      audioData: DataContent;
      mimeType: string;
    },
    options: FunctionCallOptions
  ) {
    const rawResponse = await this.callAPI(
      {
        fileExtension: getAudioFileExtension(mimeType),
        audioData: convertDataContentToUint8Array(audioData),
      },
      options
    );

    return {
      rawResponse,
      transcription: rawResponse.text,
    };
  }

  async callAPI(
    input: {
      fileExtension: string;
      audioData: Uint8Array;
    },
    callOptions: FunctionCallOptions
  ) {
    const { temperature } = this.settings;
    const api = this.settings.api ?? new WhisperCppApiConfiguration();
    const abortSignal = callOptions.run?.abortSignal;

    return callWithRetryAndThrottle({
      retry: api.retry,
      throttle: api.throttle,
      call: async () => {
        const formData = new FormData();
        formData.append(
          "file",
          new Blob([input.audioData]),
          `audio.${input.fileExtension}`
        );
        formData.append("response_format", "json");

        if (temperature != null) {
          formData.append("temperature", temperature.toString());
        }

        return postToApi({
          url: api.assembleUrl("/inference"),
          headers: api.headers({
            functionType: callOptions.functionType,
            functionId: callOptions.functionId,
            run: callOptions.run,
            callId: callOptions.callId,
          }),
          body: {
            content: formData,
            values: { temperature },
          },
          failedResponseHandler,
          successfulResponseHandler,
          abortSignal,
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

const whisperCppTranscriptionJsonSchema = z.union([
  z.object({ text: z.string() }),
  z.object({ error: z.string() }),
]);

const successfulResponseHandler: ResponseHandler<{
  text: string;
}> = async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();

  const parsedResult = safeParseJSON({
    text: responseBody,
    schema: zodSchema(whisperCppTranscriptionJsonSchema),
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

  if ("error" in parsedResult.value) {
    throw new ApiCallError({
      message: parsedResult.value.error,
      statusCode: response.status,
      responseBody,
      url,
      requestBodyValues,
    });
  }

  return {
    text: parsedResult.value.text.trim(),
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
