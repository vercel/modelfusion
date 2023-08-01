import { nanoid as createId } from "nanoid";
import { startDurationMeasurement } from "../../util/DurationMeasurement.js";
import { AbortError } from "../../util/api/AbortError.js";
import { runSafe } from "../../util/runSafe.js";
import { FunctionOptions } from "../FunctionOptions.js";
import { ModelCallEventSource } from "../ModelCallEventSource.js";
import { DeltaEvent } from "./DeltaEvent.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "./TextGenerationModel.js";
import { extractTextDeltas } from "./extractTextDeltas.js";
import { CallMetadata } from "model-function/executeCall.js";

export async function streamText<
  PROMPT,
  FULL_DELTA,
  SETTINGS extends TextGenerationModelSettings,
>(
  model: TextGenerationModel<PROMPT, unknown, FULL_DELTA, SETTINGS> & {
    generateDeltaStreamResponse: (
      prompt: PROMPT,
      options: FunctionOptions<SETTINGS>
    ) => PromiseLike<AsyncIterable<DeltaEvent<FULL_DELTA>>>;
    extractTextDelta: (fullDelta: FULL_DELTA) => string | undefined;
  },
  prompt: PROMPT,
  options?: FunctionOptions<SETTINGS>
): Promise<{
  textStream: AsyncIterable<string>;
  metadata: Omit<
    CallMetadata<TextGenerationModel<PROMPT, unknown, FULL_DELTA, SETTINGS>>,
    "durationInMs"
  >;
}> {
  if (options?.settings != null) {
    model = model.withSettings(options.settings);
    options = {
      functionId: options.functionId,
      run: options.run,
    };
  }

  const run = options?.run;
  const settings = model.settings;

  const eventSource = new ModelCallEventSource({
    observers: [...(settings.observers ?? []), ...(run?.observers ?? [])],
    errorHandler: run?.errorHandler,
  });

  const durationMeasurement = startDurationMeasurement();

  const startMetadata = {
    callId: `call-${createId()}`,
    runId: run?.runId,
    sessionId: run?.sessionId,
    userId: run?.userId,
    functionId: options?.functionId,
    model: model.modelInformation,
    startEpochSeconds: durationMeasurement.startEpochSeconds,
  };

  eventSource.notifyModelCallStarted({
    type: "text-streaming-started",
    metadata: startMetadata,
    settings,
    prompt,
  });

  const result = await runSafe(async () =>
    extractTextDeltas({
      deltaIterable: await model.generateDeltaStreamResponse(prompt, {
        functionId: options?.functionId,
        settings, // options.setting is null here because of the initial guard
        run,
      }),
      extractDelta: (fullDelta) => model.extractTextDelta(fullDelta),
      onDone: (fullText, lastFullDelta) => {
        const finishMetadata = {
          ...startMetadata,
          durationInMs: durationMeasurement.durationInMs,
        };

        eventSource.notifyModelCallFinished({
          type: "text-streaming-finished",
          status: "success",
          metadata: finishMetadata,
          settings,
          prompt,
          response: lastFullDelta,
          generatedText: fullText,
        });
      },
      onError: (error) => {
        const finishMetadata = {
          ...startMetadata,
          durationInMs: durationMeasurement.durationInMs,
        };

        eventSource.notifyModelCallFinished(
          error instanceof AbortError
            ? {
                type: "text-streaming-finished",
                status: "abort",
                metadata: finishMetadata,
                settings,
                prompt,
              }
            : {
                type: "text-streaming-finished",
                status: "failure",
                metadata: finishMetadata,
                settings,
                prompt,
                error,
              }
        );
      },
    })
  );

  if (!result.ok) {
    const finishMetadata = {
      ...startMetadata,
      durationInMs: durationMeasurement.durationInMs,
    };

    if (result.isAborted) {
      eventSource.notifyModelCallFinished({
        type: "text-streaming-finished",
        status: "abort",
        metadata: finishMetadata,
        settings,
        prompt,
      });
      throw new AbortError();
    }

    eventSource.notifyModelCallFinished({
      type: "text-streaming-finished",
      status: "failure",
      metadata: finishMetadata,
      settings,
      prompt,
      error: result.error,
    });
    throw result.error;
  }

  return {
    textStream: result.output,
    metadata: startMetadata,
  };
}
