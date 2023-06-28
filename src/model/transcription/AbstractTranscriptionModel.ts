import { AbstractModel } from "../AbstractModel.js";
import { FunctionOptions } from "../FunctionOptions.js";
import { executeCall } from "../executeCall.js";
import {
  TranscriptionModel,
  TranscriptionModelSettings,
} from "./TranscriptionModel.js";

export abstract class AbstractTranscriptionModel<
    DATA,
    RESPONSE,
    SETTINGS extends TranscriptionModelSettings
  >
  extends AbstractModel<SETTINGS>
  implements TranscriptionModel<DATA, SETTINGS>
{
  constructor({
    settings,
    extractTranscription,
    generateResponse,
  }: {
    settings: SETTINGS;
    extractTranscription: (response: RESPONSE) => string;
    generateResponse: (
      data: DATA,
      options?: FunctionOptions<SETTINGS>
    ) => PromiseLike<RESPONSE>;
  }) {
    super({ settings });
    this.extractTranscription = extractTranscription;
    this.generateResponse = generateResponse;
  }

  private extractTranscription: (response: RESPONSE) => string;
  private generateResponse: (
    data: DATA,
    options?: FunctionOptions<SETTINGS>
  ) => PromiseLike<RESPONSE>;

  async transcribe(
    data: DATA,
    options?: FunctionOptions<SETTINGS>
  ): Promise<string> {
    return executeCall({
      model: this,
      options,
      errorHandler: this.uncaughtErrorHandler,
      callModel: (model, options) => model.transcribe(data, options),
      generateResponse: (options) => this.generateResponse(data, options),
      extractOutputValue: this.extractTranscription,
      getStartEvent: (metadata) => ({
        type: "transcription-started",
        metadata,
        data,
      }),
      getAbortEvent: (metadata) => ({
        type: "transcription-finished",
        status: "abort",
        metadata,
        data,
      }),
      getFailureEvent: (metadata, error) => ({
        type: "transcription-finished",
        status: "failure",
        metadata,
        data,
        error,
      }),
      getSuccessEvent: (metadata, response, output) => ({
        type: "transcription-finished",
        status: "success",
        metadata,
        data,
        response,
        transcription: output,
      }),
    });
  }
}
