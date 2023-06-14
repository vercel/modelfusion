import { nanoid as createId } from "nanoid";
import { AbortError } from "../../util/api/AbortError.js";
import { runSafe } from "../../util/runSafe.js";
import { AbstractModel } from "../AbstractModel.js";
import { FunctionOptions } from "../FunctionOptions.js";
import {
  TranscriptionModel,
  TranscriptionModelSettings,
} from "./TranscriptionModel.js";
import {
  TranscriptionFinishedEvent,
  TranscriptionStartedEvent,
} from "./TranscriptionObserver.js";

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
    if (options?.settings != null) {
      return this.withSettings(options.settings).transcribe(data, {
        functionId: options.functionId,
        run: options.run,
      });
    }

    const run = options?.run;

    const startTime = performance.now();
    const startEpochSeconds = Math.floor(
      (performance.timeOrigin + startTime) / 1000
    );

    const startMetadata = {
      runId: run?.runId,
      sessionId: run?.sessionId,
      userId: run?.userId,

      functionId: options?.functionId,
      callId: createId(),

      model: this.modelInformation,

      startEpochSeconds,
    };

    const startEvent: TranscriptionStartedEvent = {
      type: "transcription-started",
      metadata: startMetadata,
      data,
    };

    this.callEachObserver(run, (observer) => {
      observer?.onTranscriptionStarted?.(startEvent);
    });

    const result = await runSafe(() =>
      this.generateResponse(data, {
        functionId: options?.functionId,
        settings: this.settings, // options.setting is null here
        run,
      })
    );

    const generationDurationInMs = Math.ceil(performance.now() - startTime);

    const metadata = {
      durationInMs: generationDurationInMs,
      ...startMetadata,
    };

    if (!result.ok) {
      if (result.isAborted) {
        const endEvent: TranscriptionFinishedEvent = {
          type: "transcription-finished",
          status: "abort",
          metadata,
          data,
        };

        this.callEachObserver(run, (observer) => {
          observer?.onTranscriptionFinished?.(endEvent);
        });

        throw new AbortError();
      }

      const endEvent: TranscriptionFinishedEvent = {
        type: "transcription-finished",
        status: "failure",
        metadata,
        data,
        error: result.error,
      };

      this.callEachObserver(run, (observer) => {
        observer?.onTranscriptionFinished?.(endEvent);
      });

      // TODO instead throw a generate text error with a cause?
      throw result.error;
    }

    const transcription = this.extractTranscription(result.output);

    const endEvent: TranscriptionFinishedEvent = {
      type: "transcription-finished",
      status: "success",
      metadata,
      data,
      transcription,
    };

    this.callEachObserver(run, (observer) => {
      observer?.onTranscriptionFinished?.(endEvent);
    });

    return transcription;
  }
}
