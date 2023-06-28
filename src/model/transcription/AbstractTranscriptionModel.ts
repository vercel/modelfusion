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
      callModel: (options) => this.transcribe(data, options),
      notifyObserverAboutStart: (observer, startMetadata) => {
        observer?.onTranscriptionStarted?.({
          type: "transcription-started",
          metadata: startMetadata,
          data,
        });
      },
      notifyObserverAboutAbort(observer, metadata) {
        observer?.onTranscriptionFinished?.({
          type: "transcription-finished",
          status: "abort",
          metadata,
          data,
        });
      },
      notifyObserverAboutFailure(observer, metadata, error) {
        observer?.onTranscriptionFinished?.({
          type: "transcription-finished",
          status: "failure",
          metadata,
          data,
          error,
        });
      },
      notifyObserverAboutSuccess(observer, metadata, output) {
        observer?.onTranscriptionFinished?.({
          type: "transcription-finished",
          status: "success",
          metadata,
          data,
          transcription: output,
        });
      },
      errorHandler: this.uncaughtErrorHandler,
      generateResponse: (options) => this.generateResponse(data, options),
      extractOutputValue: this.extractTranscription,
    });
  }
}
